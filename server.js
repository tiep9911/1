const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// =================================================================
// === Lấy thông tin từ Biến Môi Trường đã cài đặt trên Render ===
// =================================================================
const WEBSOCKET_URL = process.env.WEBSOCKET_URL;
const AUTH_INFO = process.env.AUTH_INFO;
const AUTH_SIGNATURE = process.env.AUTH_SIGNATURE;


// === Biến lưu trạng thái ===
let currentData = {
  id: "binhtool90",
  id_phien: null,
  ket_qua: "",
  pattern: "",
  du_doan: "?"
};
let id_phien_chua_co_kq = null;
let patternHistory = []; // Lưu dãy T/X gần nhất


// =================================================================
// === Danh sách tin nhắn gửi lên server WebSocket ===
// === Dùng thông tin mới bạn lấy được để tạo lại tin nhắn xác thực ===
// =================================================================
const messagesToSend = [
  // Tin nhắn xác thực mới
  [1, "Simms", "SC_tiep1412010", "tiep2010", {
    "info": AUTH_INFO,
    "signature": AUTH_SIGNATURE,
    "pid": 4,
    "subi": true
  }],
  // Các tin nhắn để lấy dữ liệu game
  [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
  [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
];


// === WebSocket ===
let ws = null;
let pingInterval = null;
let reconnectTimeout = null;
let isManuallyClosed = false;

// Hàm dự đoán, không thay đổi
function duDoanTiepTheo(pattern) {
  if (pattern.length < 6) return "?";

  const last3 = pattern.slice(-3).join('');
  const last4 = pattern.slice(-4).join('');

  const count = pattern.join('').split(last3).length - 1;
  if (count >= 2) return last3[0];

  const count4 = pattern.join('').split(last4).length - 1;
  if (count4 >= 2) return last4[0];

  return "?";
}

// Hàm kết nối WebSocket đã được sửa
function connectWebSocket() {
  // Kiểm tra xem các biến môi trường đã được set chưa
  if (!WEBSOCKET_URL || !AUTH_INFO || !AUTH_SIGNATURE) {
    console.log('[❌] Lỗi: Vui lòng cài đặt các biến WEBSOCKET_URL, AUTH_INFO, và AUTH_SIGNATURE trên Render.');
    return; // Dừng lại nếu thiếu thông tin
  }

  // Chú ý dùng WEBSOCKET_URL mới ở đây
  ws = new WebSocket(
    WEBSOCKET_URL,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Origin": "https://play.sun.win"
      }
    }
  );

  ws.on('open', () => {
    console.log('[✅] Đã kết nối WebSocket');
    messagesToSend.forEach((msg, i) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }, i * 600);
    });

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 15000);
  });

  ws.on('pong', () => {
    // console.log('[📶] Ping OK'); // Có thể tắt log này đi cho đỡ rối
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (Array.isArray(data) && typeof data[1] === 'object') {
        const cmd = data[1].cmd;

        if (cmd === 1008 && data[1].sid) {
          id_phien_chua_co_kq = data[1].sid;
        }

        if (cmd === 1003 && data[1].gBB) {
          const { d1, d2, d3 } = data[1];
          const total = d1 + d2 + d3;
          const result = total > 10 ? "T" : "X";

          patternHistory.push(result);
          if (patternHistory.length > 20) patternHistory.shift();

          const text = `${d1}-${d2}-${d3} = ${total} (${result === 'T' ? 'Tài' : 'Xỉu'})`;
          const du_doan = duDoanTiepTheo(patternHistory);

          currentData = {
            id: "binhtool90",
            id_phien: id_phien_chua_co_kq,
            ket_qua: text,
            pattern: patternHistory.join(''),
            du_doan: du_doan === "T" ? "Tài" : du_doan === "X" ? "Xỉu" : "?"
          };

          console.log(`🎲 Phiên ${id_phien_chua_co_kq}: ${text} → Dự đoán: ${currentData.du_doan}`);
          id_phien_chua_co_kq = null;
        }
      }
    } catch (e) {
      console.error('[❌] Lỗi xử lý:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[🔌] Mất kết nối WebSocket. Đang reconnect...');
    clearInterval(pingInterval);
    if (!isManuallyClosed) {
      reconnectTimeout = setTimeout(connectWebSocket, 2500);
    }
  });

  ws.on('error', (err) => {
    console.error('[⚠️] WebSocket lỗi:', err.message);
  });
}

// === API ===
app.get('/taixiu', (req, res) => {
  res.json(currentData);
});

app.get('/', (req, res) => {
  res.send(`<h2>🎯 SunWin Tài Xỉu</h2><p><a href="/taixiu">Xem JSON kết quả</a></p>`);
});

// === Khởi động server ===
app.listen(PORT, () => {
  console.log(`[🌐] Server đang chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});
