// route luong du lieu cua dashboard
import dashboard from '../controllers/dashboard.js';
import express from 'express';
const dashboardRoute = express.Router();

dashboardRoute.get(`/`, dashboard.mainpage);
dashboardRoute.get('/profile', dashboard.getProfile); 

export default dashboardRoute;