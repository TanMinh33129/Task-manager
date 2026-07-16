// lệnh chạy server 
## Chạy backend chạy backend 
cd backend
npm install
  => npm run dev

## Bước 2:  Chạy frontend
cd frontend
npm install
  => npm run dev

## Bước 3 — Tạo file .env trong thư mục server 
PORT=5000
MONGO_URI=mongodb://...  (lấy từ MongoDB Atlas)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

## Bước 4: Truy cập
Frontend: http://localhost:5173
Backend:  http://localhost:5000

//Api dùng để check bằng Postman khi  server  chạy
// Khi đăng nhập user trên Postman 

1. Check tình trạng server
http://localhost:5000/api/health  => Dùng GET

2. Check phần đăng nhập 
http://localhost:5000/api/auth/login  => Dùng POST
Ví dụ:
{
  "email": "test@gmail.com",
  "password": "123456"
}
# Nhập vào Body/raw(Json)

3. Test đăng ký Admin 
http://localhost:5000/api/auth/register   => Dùng POST
Body/raw(Json)
{
  "name": "Admin",
  "email": "admin@gmail.com",
  "password": "123456",
  "role": "admin"
}

4. Test đăng ký User
http://localhost:5000/api/auth/register   => Dùng POST
Body/raw(Json)
{
  "name": "Nguyen Van A",
  "email": "test@gmail.com",
  "password": "123456"
}

5. Test tạo task 
http://localhost:5000/api/tasks
Body/raw(Json)
{
  "title": "Học MERN Stack",
  "description": "Hoàn thành backend",
  "priority": "high",
  "status": "in-progress"
}


