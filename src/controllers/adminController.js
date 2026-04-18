import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'adminDashboard.html'));
};
