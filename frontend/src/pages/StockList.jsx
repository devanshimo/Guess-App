import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "../axios";
import StockModal from "../components/StockModal";
import DeleteDialog from "../components/DeleteDialog";
import { toast } from "react-toastify";

export default function StockList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editStock, setEditStock] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/portfolio/stocks/");
      setStocks(res.data);
    } catch (err) {
      toast.error("Failed to load stocks");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filtered = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2} fontWeight={600}>
        Your Stocks
      </Typography>

      {/* Search + Add */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search Ticker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mr: 2, width: "250px" }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditStock(null);
            setOpenModal(true);
          }}
        >
          Add Stock
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Buy Price</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No stocks found.
                  </TableCell>
                </TableRow>
              )}

              {filtered.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.ticker}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>₹{stock.avg_buy_price}</TableCell>

                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setEditStock(stock);
                        setOpenModal(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => setDeleteId(stock.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Modal */}
      <StockModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        refresh={fetchStocks}
        editData={editStock}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          try {
            await axios.delete(`/portfolio/stocks/${deleteId}/`);
            toast.success("Stock deleted");
            fetchStocks();
          } catch (err) {
            toast.error("Delete failed");
          }
          setDeleteId(null);
        }}
      />
    </Box>
  );
}
