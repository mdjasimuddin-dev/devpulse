import { Router } from 'express';
import { issuesController } from './issue.controller';
import auth from '../../middleware/middleware.index';

const router = Router();

router.post('/', auth('contributor', 'maintainer'), issuesController.createIssues);

export const issueRoute = router;
