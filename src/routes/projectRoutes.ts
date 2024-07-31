import { Router } from "express"
import { ProjectController } from "../controllers/ProjectController"
import { body, param } from "express-validator"
import { handleInputErrors } from "../middleware/validation"
import { TaskController } from "../controllers/TaskController"
import { projectExists } from "../middleware/project"
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task"
import { authenticate } from "../middleware/auth"
import { TeamMemberController } from "../controllers/TeamController"

const router = Router()

router.use(authenticate)

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('Project name is required'),
    body('clientName')
        .notEmpty().withMessage('Client name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', authenticate, ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id', 
    param('id').isMongoId().withMessage('Invalid project ID'),    
    body('projectName')
        .notEmpty().withMessage('Project name is required'),
    body('clientName')
        .notEmpty().withMessage('Client name is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    ProjectController.deleteProject
)

// Routes for tasks
router.param('projectId', projectExists)

router.post('/:projectId/tasks',
    hasAuthorization, 
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Task description is required'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks', 
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    TaskController.getProjectTasks
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId', 
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Task description is required'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status', 
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('status').notEmpty().withMessage('Task status is required'),
    handleInputErrors,
    TaskController.updateStatus
)

/* Routes for teams */
router.post('/:projectId/team/find',
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    body('email').isEmail().toLowerCase().withMessage('Invalid e-mail address'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    body('id').isMongoId().withMessage('Invalid user ID'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('userId').isMongoId().withMessage('Invalid user ID'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

export default router