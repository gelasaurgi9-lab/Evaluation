import express from 'express';
import {
  createEvaluationForm,
  submitEvaluationResponse,
  getEvaluationForm,
  getEvaluationResponses,
  getAllEvaluationForms,
  deleteEvaluationForm,
  updateEvaluationStatus,
  getEvaluationResponceByUserId,
  updateEvaluation
} from '../Controller/evaluation.controller.js';
import { protect, authorize } from '../Middleware/protect.js';
import EvaluationResponse from '../Model/EvaluationResponse.model.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Quality Officer routes
router.route('/').post(authorize('quality_officer'), createEvaluationForm);
router.route('/').get(authorize('quality_officer', "Student", 'instructor', 'department_head', 'college_dean', 'Human_resours', 'Vice_academy'), getAllEvaluationForms);
router.route('/:id/status').patch(authorize('quality_officer'), updateEvaluationStatus);
router.route('/:id').patch(authorize('quality_officer'), updateEvaluation);
router.route('/:id').delete(authorize('quality_officer'), deleteEvaluationForm);

// Student/Instructor routes
router.route('/:id')
  .get(authorize('Student', 'instructor', 'quality_officer'), getEvaluationForm);
router.route('peer-evaluation/:id')
  .get(authorize('instructor'), getEvaluationForm);

router.route('/:id/responses')
  .post(authorize('Student', 'instructor', 'department_head'), submitEvaluationResponse)
  .get(authorize('quality_officer', 'department_head', 'instructor', 'college_dean', 'Human_resours', 'Vice_academy'), getEvaluationResponses);

// Route to get evaluation responses by instructor ID
router.route('/instructor-responses')
  .post(authorize('quality_officer', 'department_head', 'instructor', 'college_dean', 'Human_resours', 'Vice_academy'), getEvaluationResponceByUserId);

// Bulk fetch responses endpoint
router.post('/responses/bulk', authorize('quality_officer', 'department_head', 'instructor', 'college_dean', 'Human_resours', 'Vice_academy'), async (req, res) => {
  try {
    const { responseIds } = req.body;

    // Fetch response documents from your database
    const responses = await EvaluationResponse.find({
      _id: { $in: responseIds }
    });

    return res.json(responses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
