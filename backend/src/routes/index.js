const express = require('express');
const jobsController = require('../controllers/jobs');
const reportsController = require('../controllers/reports');
const configController = require('../controllers/config');
const adminJobsController = require('../controllers/adminJobs');
const countriesController = require('../controllers/countries');
const adminConfigController = require('../controllers/adminConfig');
const eventsController = require('../controllers/events');

const router = express.Router();

// Public / Client APIs
router.get('/jobs', jobsController.listJobs);
router.get('/job/detail', jobsController.getJobDetail);
router.post('/report', reportsController.createReport);
router.get('/app/config', configController.getAppConfig);
router.get('/countries', countriesController.listCountries);

// Admin Job CRUD APIs
router.post('/admin/jobs', adminJobsController.createJob);
router.get('/admin/jobs', adminJobsController.adminListJobs);
router.patch('/admin/jobs/:id', adminJobsController.updateJob);
router.delete('/admin/jobs/:id', adminJobsController.deleteJob);
router.patch('/admin/jobs/:id/review', adminJobsController.reviewJob);

// Admin Report APIs
router.get('/admin/reports', reportsController.listReports);
router.post('/admin/reports/:id/handle', reportsController.handleReport);

// Admin Country & Config APIs
router.get('/admin/countries', countriesController.listCountries);
router.post('/admin/countries/:code', countriesController.createOrUpdateCountry);
router.delete('/admin/countries/:code', countriesController.deleteCountry);
router.get('/admin/configs', adminConfigController.getAdminConfig);
router.post('/admin/configs', adminConfigController.updateAdminConfig);

// Events APIs
router.post('/events', eventsController.createEvent);
router.get('/admin/events/stats', eventsController.getEventStats);
router.get('/admin/events/job-stats', eventsController.getJobStats);
router.get('/admin/stats', eventsController.getEventStats);

module.exports = router;
