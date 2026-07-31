import { Router } from 'express';
import { issuesController } from './issue.controller';
import auth from '../../middleware/middleware.index';

const router = Router();

router.post('/', auth('maintainer', 'contributor'), issuesController.createIssues);
router.get('/', issuesController.readAllIssues);
router.get('/:id', issuesController.readSingleIssue);
router.patch('/:id', auth('contributor', 'maintainer'), issuesController.updateIssue);

export const issueRoute = router;
