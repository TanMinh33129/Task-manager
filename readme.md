// lệnh chạy server 
1. chạy backend 
cd backend  => npm run dev

2. Chạy fontend(client)
cd clent => npm run dev


//Api dùng để check bằng Postman khi  server  chạy

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
