# Smart Kids Daily Planner

Smart Kids Daily Planner is a full‑stack web application that helps parents organize their children's daily routines. It includes a planner, child management, and email notifications.

## Features
- Add daily tasks for children
- Add children profiles
- Categorized planner (Study, Meals, Sleep, Activities, Tasks)
- Email notifications using Nodemailer + Mailtrap
- Search and filter
- Responsive design
- Clean UI with multiple screens

## Tech Stack
### Frontend
- HTML5  
- CSS3  
- JavaScript  

### Backend
- Node.js  
- Express.js  
- Nodemailer (Mailtrap SMTP)  

## API Endpoints

### Tasks
- `POST /api/tasks` — Add task  
- `GET /api/tasks` — Get all tasks  
- `PUT /api/tasks/:id` — Edit task  
- `DELETE /api/tasks/:id` — Delete task  

### Children
- `POST /api/children` — Add child  
- `GET /api/children` — Get children  
- `GET /api/children/:id/tasks` — Get tasks for child  
- `DELETE /api/children/:id` — Delete child  

### Email
- `POST /api/send-email` — Send email notification

## 📧 Email Setup (Mailtrap)
Create a `.env` file:

