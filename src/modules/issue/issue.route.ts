import { Router } from 'express';
import { issuesController } from './issue.controller';
import auth from '../../middleware/middleware.index';

const router = Router();

router.post('/', auth('maintainer', 'contributor'), issuesController.createIssues);
router.get('/', issuesController.readAllIssues);

export const issueRoute = router;
