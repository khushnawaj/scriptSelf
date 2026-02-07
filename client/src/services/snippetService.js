/**
 * Snippet Service
 * Fetches dynamic, real-time programming snippets from multiple public APIs.
 * Prioritizes live data sources to ensure non-repetitive content.
 */

const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour Cache

// --- UTILITIES ---

const decodeHTMLEntities = (text) => {
    if (!text) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

const cleanSnippet = (code, lang) => {
    // Remove comments, empty lines, and excessive whitespace
    let lines = code
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '') // Remove JS/C style comments
        .replace(/([^\\:]|^)#.*$/gm, '') // Remove Python/Shell style comments
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 15 && line.length < 90 && !line.startsWith('import') && !line.startsWith('export') && !line.startsWith('from'));

    if (lang === 'python') {
        lines = lines.map(l => l.replace(/;$/, '')); // Remove trailing semicolons for Python
    }

    return lines.slice(0, 5); // Take up to 5 valid lines
};

// --- DYNAMIC SOURCES ---

// 1. StackExchange API (Overflow) - High quality, voted answers
const fetchStackOverflowSnippet = async (tag) => {
    try {
        const tagMap = {
            'html': 'html5',
            'react': 'reactjs',
            'nodejs': 'node.js',
            'css': 'css',
            'sql': 'sql',
            'python': 'python',
            'git': 'git',
            'docker': 'docker'
        };
        const searchTag = tagMap[tag] || tag;

        // Prevent generic 'js' tag which returns too much garbage
        const finalTag = (searchTag === 'js') ? 'javascript' : searchTag;

        const res = await fetch(`https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${finalTag}&site=stackoverflow&pagesize=10`);
        if (!res.ok) throw new Error(`SO API status: ${res.status}`);

        const data = await res.json();

        if (!data.items || data.items.length === 0) return null;

        // Try up to 3 random questions to find one with a valid code block
        for (let i = 0; i < 3; i++) {
            const randomQ = data.items[Math.floor(Math.random() * data.items.length)];

            try {
                // Use 'withbody' filter to get the answer body
                const answerRes = await fetch(`https://api.stackexchange.com/2.3/questions/${randomQ.question_id}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody`);
                if (!answerRes.ok) continue;

                const answerData = await answerRes.json();

                if (answerData.items && answerData.items.length > 0) {
                    const body = answerData.items[0].body;
                    // Extract code block from HTML
                    const match = body.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
                    if (match && match[1]) {
                        const clean = decodeHTMLEntities(match[1]);
                        const lines = cleanSnippet(clean, tag);
                        if (lines.length > 0) {
                            return {
                                question: decodeHTMLEntities(randomQ.title),
                                code: lines[Math.floor(Math.random() * lines.length)]
                            };
                        }
                    }
                }
            } catch (e) {
                continue;
            }
        }
    } catch (err) {
        console.warn("StackOverflow API fail:", err);
    }
    return null;
};

// 2. GitHub Gist API - Real User Code
const fetchGistSnippet = async (lang) => {
    try {
        const res = await fetch(`https://api.github.com/gists/public?per_page=30`);
        if (!res.ok) return null;

        const data = await res.json();

        if (!Array.isArray(data)) return null;

        const targetLang = (lang === 'react' || lang === 'nodejs') ? 'javascript' : lang.toLowerCase();

        const validGists = data.filter(gist =>
            gist.files && Object.values(gist.files).some(f =>
                f.language && f.language.toLowerCase() === targetLang
            )
        );

        if (validGists.length > 0) {
            // Try up to 3 random gists
            for (let i = 0; i < 3; i++) {
                const randomGist = validGists[Math.floor(Math.random() * validGists.length)];
                const file = Object.values(randomGist.files).find(f =>
                    f.language && f.language.toLowerCase() === targetLang
                );

                if (file && file.raw_url) {
                    const rawRes = await fetch(file.raw_url);
                    if (rawRes.ok) {
                        const text = await rawRes.text();
                        // Basic heuristic to check if it looks like code not just text
                        if (text.length > 20 && !text.includes('<!DOCTYPE html>')) {
                            const lines = cleanSnippet(text, lang);
                            if (lines.length > 0) {
                                return {
                                    question: randomGist.description ? `Gist Challenge: ${randomGist.description.slice(0, 60)}...` : `Analyze and type this ${lang} snippet:`,
                                    code: lines[Math.floor(Math.random() * lines.length)]
                                };
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn("Gist API fail:", err);
    }
    return null;
};

// --- FALLBACKS ---
const FALLBACK_SNIPPETS = {
    js: [
        { question: "How to check if environment is development?", code: "const isDev = process.env.NODE_ENV === 'development';" },
        { question: "Mount the root React component", code: "document.querySelector('#root').render(<App />);" },
        { question: "Select data from Supabase", code: "const { data, error } = await supabase.from('users').select();" },
        { question: "Sort items by value", code: "const sorted = items.sort((a, b) => a.value - b.value);" },
        { question: "Save theme preference to localStorage", code: "localStorage.setItem('theme', isDark ? 'dark' : 'light');" }
    ],
    react: [
        { question: "Generic subscribe/unsubscribe effect", code: "useEffect(() => { const sub = api.subscribe(); return () => sub.unsubscribe(); }, []);" },
        { question: "Initialize state with reducer", code: "const [state, dispatch] = useReducer(reducer, initialState);" },
        { question: "Provide Context value to children", code: "return <Context.Provider value={value}>{children}</Context.Provider>;" },
        { question: "Memoize a complex UI component", code: "const MemoizedComponent = useMemo(() => <ComplexUI />, [deps]);" },
        { question: "Lazy load component with fallback", code: "<Suspense fallback={<Spinner />}>{children}</Suspense>" }
    ],
    nodejs: [
        { question: "Serve static files in Express", code: "app.use(express.static(path.join(__dirname, 'public')));" },
        { question: "Hash a password with bcrypt", code: "const hashedPassword = await bcrypt.hash(password, 10);" },
        { question: "Send a JSON response success", code: "res.status(200).json({ success: true, data: result });" }
    ],
    python: [
        { question: "Run an async main function", code: "import asyncio\nasync def main():\n    print('Hello')\nasyncio.run(main())" },
        { question: "Read CSV and drop NAs with Pandas", code: "df = pd.read_csv('data.csv')\ndf.dropna(inplace=True)" },
        { question: "Basic Flask route definition", code: "flask_app = Flask(__name__)\n@app.route('/')\ndef index(): return 'Hi'" },
        { question: "List comprehension for active users", code: "users = [u for u in db.users if u.is_active]" },
        { question: "Read file content context manager", code: "with open('file.txt', 'r') as f: content = f.read()" }
    ],
    html: [
        { question: "Create a button with a click handler", code: "<button onclick='handleClick()'>Click Me</button>" },
        { question: "Link a Google Font Stylesheet", code: "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Inter' />" },
        { question: "Add a meta description tag", code: "<meta name='description' content='High performance web application' />" },
        { question: "Create an accessible image", code: "<img src='logo.png' alt='Company Logo' width='200' height='50' />" },
        { question: "Define a main content area", code: "<main id='main-content' role='main' tabindex='-1'>...</main>" }
    ],
    css: [
        { question: "Create a responsive Grid layout", code: "grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));" },
        { question: "Define a dark mode variable override", code: "@media (prefers-color-scheme: dark) { :root { --bg: #000; } }" },
        { question: "Apply a subtle shadow", code: "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" },
        { question: "Flexbox centering", code: "display: flex; justify-content: center; align-items: center;" },
        { question: "CSS Transition for hover", code: "transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" }
    ],
    sql: [
        { question: "Select active users from last 24h", code: "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '1 day';" },
        { question: "Update stock atomically", code: "UPDATE products SET stock = stock - 1 WHERE id = $1 RETURNING *;" },
        { question: "Create an index on email", code: "CREATE INDEX idx_users_email ON users(email);" },
        { question: "Join orders with users", code: "SELECT orders.id, users.email FROM orders JOIN users ON orders.user_id = users.id;" },
        { question: "Count total users by country", code: "SELECT country, COUNT(*) FROM users GROUP BY country;" }
    ],
    git: [
        { question: "Commit changes with message", code: "git commit -m 'feat: implement new authentication flow'" },
        { question: "Interactive rebase last 3 commits", code: "git rebase -i HEAD~3" },
        { question: "Force push safely", code: "git push origin feature/new-ui --force-with-lease" },
        { question: "Stash changes with a name", code: "git stash push -m 'wip-login-fix'" },
        { question: "Create and switch to new branch", code: "git checkout -b fix/api-timeout" }
    ],
    docker: [
        { question: "Install dependencies (Clean)", code: "RUN npm ci --only=production" },
        { question: "Define container entrypoint", code: "ENTRYPOINT ['/usr/local/bin/entrypoint.sh']" },
        { question: "Add a healthcheck command", code: "HEALTHCHECK CMD curl --fail http://localhost:3000 || exit 1" },
        { question: "Copy package files first", code: "COPY package*.json ./" },
        { question: "Expose port 8080", code: "EXPOSE 8080" }
    ]
};

// --- MAIN EXPORTS ---

export const fetchGitHubSnippet = async (topicId) => {
    // 1. Try GitHub Gists (Real Code) - Prioritized for stability
    const gistSnippet = await fetchGistSnippet(topicId);
    if (gistSnippet && gistSnippet.code) return gistSnippet;

    // 2. Try StackOverflow (Best Quality) - Disabled due to API instability (400 Bad Request)
    /* const snippet = await fetchStackOverflowSnippet(topicId);
    if (snippet && snippet.code) return snippet; */

    // 3. Fallback to curated library
    const fallbacks = FALLBACK_SNIPPETS[topicId];
    if (fallbacks) {
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Final default
    return FALLBACK_SNIPPETS.js[0];
};


export const fetchTechTrivia = async () => {
    // 1. Try HackerNews (Real-time events)
    if (Math.random() > 0.5) {
        const hn = await fetchHackerNewsStory();
        if (hn) return hn;
    }

    // 2. Open Trivia DB (Standard)
    try {
        const res = await fetch('https://opentdb.com/api.php?amount=1&category=18&type=multiple');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return {
                question: decodeHTMLEntities(data.results[0].question),
                answer: decodeHTMLEntities(data.results[0].correct_answer)
            };
        }
    } catch (e) { console.error(e); }

    return { question: "What is the primary language of the web?", answer: "JavaScript" };
};
