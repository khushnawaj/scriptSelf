// Since server doesn't have axios, I'll use fetch (Node 18+)

const API_URL = 'http://localhost:5000/api/v1';

const createIssue = async () => {
    try {
        const userData = {
            username: 'CommunityUser',
            email: 'community@scriptshelf.dev',
            password: 'password123'
        };

        let token;

        // 1. Try to Login
        console.log('Attempting login...');
        try {
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email, password: userData.password })
            });

            const loginData = await loginRes.json();

            if (loginData.success) {
                token = loginData.token;
                console.log('Logged in successfully.');
            }
        } catch (e) {
            console.log('Login failed, trying registration...');
        }

        // 2. Register if login failed or no token
        if (!token) {
            console.log('Registering new user...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const regData = await regRes.json();

            if (!regData.success) {
                console.error('Registration failed:', regData.error);
                return;
            }
            token = regData.token;
            console.log('Registered successfully.');
        }

        // 3. Create Issue
        console.log('Creating example issue...');
        const issueData = {
            title: 'CORS error when fetching public notes via API',
            content: 'I am trying to fetch public notes for my portfolio site using the API, but I keep getting this error in the console:\n\n```\nAccess to fetch at \'http://api.scriptshelf.dev/v1/notes\' from origin \'http://localhost:3000\' has been blocked by CORS policy.\n```\n\nIs there a way to whitelist my domain or should I proxy the requests?',
            type: 'issue',
            isPublic: true,
            tags: 'api, cors, backend, bug',
            category: null
        };

        // Need to get a category ID first usually
        const catRes = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const catData = await catRes.json();
        if (catData.success && catData.data.length > 0) {
            issueData.category = catData.data[0]._id;
        } else {
            console.log('No categories found. Creating "General"...');
            const newCatRes = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: 'General', description: 'General discussion' })
            });
            const newCatData = await newCatRes.json();
            if (newCatData.success) {
                issueData.category = newCatData.data._id;
            } else {
                console.error('Failed to create category:', newCatData.error);
                return;
            }
        }

        const noteRes = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(issueData)
        });

        const noteData = await noteRes.json();

        if (noteData.success) {
            console.log('Example Issue Created Successfully!');
            console.log('ID:', noteData.data._id);
            console.log('Title:', noteData.data.title);
        } else {
            console.error('Failed to create issue:', noteData.error);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
};

createIssue();
