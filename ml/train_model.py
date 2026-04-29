import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping
import datetime

SEQ_LEN = 60       # use past 60 days
FUTURE_DAYS = 7    # forecast next 7 days

def load_data(symbol):
    df = yf.download(symbol, period='2y')
    df = df[['Close']]
    df.dropna(inplace=True)
    return df

def prepare_sequences(data):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(data)

    X, y = [], []
    for i in range(SEQ_LEN, len(scaled)-FUTURE_DAYS):
        X.append(scaled[i-SEQ_LEN:i])
        y.append(scaled[i:i+FUTURE_DAYS])

    return np.array(X), np.array(y), scaler

def build_model():
    encoder_inputs = Input(shape=(SEQ_LEN, 1))
    encoder_lstm = LSTM(128, return_state=True)
    _, state_h, state_c = encoder_lstm(encoder_inputs)
    encoder_states = [state_h, state_c]

    decoder_inputs = Input(shape=(FUTURE_DAYS, 1))
    decoder_lstm = LSTM(128, return_sequences=True)
    decoder_outputs = decoder_lstm(decoder_inputs, initial_state=encoder_states)
    decoder_dense = Dense(1)
    decoder_outputs = decoder_dense(decoder_outputs)

    model = Model([encoder_inputs, decoder_inputs], decoder_outputs)
    model.compile(optimizer='adam', loss='mse')

    return model

def train(symbol="AAPL"):
    df = load_data(symbol)
    X, y, scaler = prepare_sequences(df.values)

    # decoder input (zeros)
    decoder_input = np.zeros((X.shape[0], FUTURE_DAYS, 1))

    model = build_model()

    es = EarlyStopping(monitor='loss', patience=8, restore_best_weights=True)

    model.fit(
        [X, decoder_input],
        y,
        epochs=40,
        batch_size=32,
        callbacks=[es]
    )

    model.save("model.h5")
    np.save("scaler.npy", scaler.scale_)
    np.save("scaler_min.npy", scaler.min_)

    print("Training complete. Model saved as model.h5")

if __name__ == "__main__":
    train("AAPL")