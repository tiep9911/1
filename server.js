const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// =================================================================
// === Thông tin xác thực được đưa trực tiếp vào code ===
// =================================================================
const WEBSOCKET_URL = "wss://websocket.azhkthg1.net/wsbinary?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJ0aWVwODBjbSIsImJvdCI6MCwiaXNNZXJjaGFudCI6ZmFsc2UsInZlcmlmaWVkQmFua0FjY291bnQiOmZhbHNlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjIzMTQ0NDI0NCwiYWZmSWQiOiI5YTUyZTZhMy00NmU2LTRkMWYtYTg2OC0xZWE2MDAyNTRkZWEiLCJiYW5uZWQiOmZhbHNlLCJicmFuZCI6InN1bi53aW4iLCJ0aW1lc3RhbXAiOjE3NTM3NTMzNzA0NTEsImxvY2tHYW1lcyI6W10sImFtb3VudCI6MCwibG9ja0NoYXQiOmZhbHNlLCJwaG9uZVZlcmlmaWVkIjp0cnVlLCJpcEFkZHJlc3MiOiIyNDAyOjgwMDo2MWVhOmI2NzM6NzAyZjo2YWZmOmZlYjA6ZjZhMiIsIm11dGUiOmZhbHNlLCJhdmF0YXIiOiJodHRwczovL2ltYWdlcy5zd2luc2hvcC5uZXQvaW1hZ2VzL2F2YXRhci9hdmF0YXJfMTMucG5nIiwicGxhdGZvcm1JZCI6MiwidXNlcklkIjoiOWE1MmU2YTMtNDZlNi00ZDFmLWE4NjgtMWVhNjAwMjU0ZGVhIiwicmVnVGltZSI6MTc0NDAwNDk3NTMzMCwicGhvbmUiOiI4NDMyNjA5MjExMCIsImRlcG9zaXQiOnRydWUsInVzZXJuYW1lIjoiU0NfdGllcDE0MTIwMTAifQ.cOOWtxV7i9uesoUiUNh0PTCl-yqgYNgODllfbGUUGoY";
const AUTH_INFO = "{\"ipAddress\":\"2402:800:61ea:b673:702f:6aff:feb0:f6a2\",\"wsToken\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJ0aWVwODBjbSIsImJvdCI6MCwiaXNNZXJjaGFudCI6ZmFsc2UsInZlcmlmaWVkQmFua0FjY291bnQiOmZhbHNlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjIzMTQ0NDI0NCwiYWZmSWQiOiI5YTUyZTZhMy00NmU2LTRkMWYtYTg2OC0xZWE2MDAyNTRkZWEiLCJiYW5uZWQiOmZhbHNlLCJicmFuZCI6InN1bi53aW4iLCJ0aW1lc3RhbXAiOjE3NTM3NTAzODY5NzQsImxvY2tHYW1lcyI6W10sImFtb3VudCI6MCwibG9ja0NoYXQiOmZhbHNlLCJwaG9uZVZlcmlmaWVkIjp0cnVlLCJpcEFkZHJlc3MiOiIyNDAyOjgwMDo2MWVhOmI2NzM6NzAyZjo2YWZmOmZlYjA6ZjZhMiIsIm11dGUiOmZhbHNlLCJhdmF0YXIiOiJodHRwczovL2ltYWdlcy5zd2luc2hvcC5uZXQvaW1hZ2VzL2F2YXRhci9hdmF0YXJfMTMucG5nIiwicGxhdGZvcm1JZCI6MiwidXNlcklkIjoiOWE1MmU2YTMtNDZlNi00ZDFmLWE4NjgtMWVhNjAwMjU0ZGVhIiwicmVnVGltZSI6MTc0NDAwNDk3NTMzMCwicGhvbmUiOiI4NDMyNjA5MjExMCIsImRlcG9zaXQiOnRydWUsInVzZXJuYW1lIjoiU0NfdGllcDE0MTIwMTAifQ.rcaly7q7oKb5kNnpYTVvd6HaiiyYt3As10G7VewsoTM\",\"locale\":\"vi\",\"userId\":\"9a52e6a3-46e6-4d1f-a868-1ea600254dea\",\"username\":\"SC_tiep1412010\",\"timestamp\":1753750386974,\"refreshToken\":\"f526496e787f4dfaaf722c090ef7e5d5.83a72373c16b4b5f83a3dc2433b20336\"}";
const AUTH_SIGNATURE = "129692409ECA9FBFED8C1AEFC52DF3A6645B8F8CED5F70EA9093931F8E2E13823E9052AADCACD57C576FC9765A941B4E7DCD3ED2012FE31B4D0CCDD44AE6524307F22C36704766D712859B02368DF4E6F01328FCF079319CA6EA62A27CEE6B4960FC74A4C36CB7B2E7C855370B64F3D92B9B7990FE5AECBF5D1D371E2265FB1E";


// === Biến lưu trạng thái ===
let currentData = { id: "binhtool90", id_phien: null, ket_qua: "", pattern: "", du_doan: "?" };
let id_phien_chua_co_kq = null;
let patternHistory = [];


// === Danh sách tin nhắn gửi lên server WebSocket ===
const messagesToSend = [
  // Tin nhắn xác thực (luôn giữ lại)
  [1, "Simms", "SC_tiep1412010", "tiep2010", {
    "info": AUTH_INFO,
    "signature": AUTH_SIGNATURE,
    "pid": 4,
    "subi": true
  }],

  // Bước 3: Thử lệnh 317
  [6, "taixiuPlugin", { cmd: 1005 }] 
];


// === WebSocket ===
let ws = null;
let pingInterval = null;
let reconnectTimeout = null;
let successTimeout = null; 

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

function connectWebSocket() {
  ws = new WebSocket(WEBSOCKET_URL, { headers: { "User-Agent": "Mozilla/5.0", "Origin": "https://play.sun.win" } });

  ws.on('open', () => {
    console.log('[✅] Đã kết nối WebSocket');
    messagesToSend.forEach((msg, i) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('Gửi đi:', JSON.stringify(msg));
          ws.send(JSON.stringify(msg));
        }
      }, i * 600);
    });

    clearTimeout(successTimeout);
    successTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('🎉🎉🎉 [THÀNH CÔNG] Lệnh đã được chấp nhận, kết nối ổn định! 🎉🎉🎉');
      }
    }, 5000); 

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) { ws.ping(); }
    }, 15000);
  });

  ws.on('pong', () => {});

  ws.on('message', (message) => {
    console.log('Nhận được:', message.toString());
  });

  ws.on('close', () => {
    clearTimeout(successTimeout); 
    console.log('[🔌] Mất kết nối WebSocket. Đang reconnect...');
    clearInterval(pingInterval);
    reconnectTimeout = setTimeout(connectWebSocket, 2500);
  });

  ws.on('error', (err) => {
    console.error('[⚠️] WebSocket lỗi:', err.message);
  });
}

// === API ===
app.get('/taixiu', (req, res) => res.json(currentData));
app.get('/', (req, res) => res.send(`<h2>🎯 SunWin Tài Xỉu</h2><p><a href="/taixiu">Xem JSON kết quả</a></p>`));

// === Khởi động server ===
app.listen(PORT, () => {
  console.log(`[🌐] Server đang chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});
