import numpy as np
import yfinance as yf
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import datetime

SEQ_LEN = 60
FUTURE_DAYS = 7

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model_converted.keras")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "scaler.npy")
SCALER_MIN_PATH = os.path.join(BASE_DIR, "ml", "scaler_min.npy")

model = load_model(MODEL_PATH,compile=False)
scale_ = np.load(SCALER_PATH)
scale_min = np.load(SCALER_MIN_PATH)


scaler = MinMaxScaler()
scaler.scale_ = scale_
scaler.min_ = scale_min

def predict_next_7(symbol):
    df = yf.download(symbol, period='90d')[['Close']]
    df.dropna(inplace=True)

    last_60 = df[-SEQ_LEN:].values

    scaled = scaler.transform(last_60)

    X = scaled.reshape(1, SEQ_LEN, 1)
    decoder_input = np.zeros((1, FUTURE_DAYS, 1))

    pred_scaled = model.predict([X, decoder_input])
    pred = scaler.inverse_transform(pred_scaled[0])

    last_date = df.index[-1]
    future_dates = [(last_date + datetime.timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(FUTURE_DAYS)]

    return {
        "prediction": pred.flatten().tolist(),
        "last_price": float(df.values[-1]),
        "future_dates": future_dates
    }
