import type { Meta, StoryObj } from "@storybook/react-vite";
import { Snippet } from "@semio/ui";

const meta: Meta<typeof Snippet> = {
  component: Snippet,
  title: "ui/Snippet",
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl bg-neutral-500 p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Snippet>;

export const JavaScript: Story = {
  name: "JavaScript",
  args: {
    text: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

const result = greet("World");`,
    language: "javascript",
  },
};

export const TypeScript: Story = {
  name: "TypeScript",
  args: {
    text: `interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(userData: Partial<User>): User {
  return {
    id: Math.random(),
    name: userData.name || "Anonymous",
    email: userData.email || "user@example.com",
  };
}`,
    language: "typescript",
  },
};

export const Python: Story = {
  args: {
    text: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
fib_sequence = [fibonacci(i) for i in range(10)]
print(fib_sequence)`,
    language: "python",
  },
};

export const HTML: Story = {
  args: {
    text: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to our site!</h1>
        <p>This is a sample HTML document.</p>
    </div>
</body>
</html>`,
    language: "html",
  },
};

export const CSS: Story = {
  args: {
    text: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}`,
    language: "css",
  },
};

export const JSON: Story = {
  args: {
    text: `{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "A sample project configuration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  }
}`,
    language: "json",
  },
};

export const SQL: Story = {
  args: {
    text: `SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;`,
    language: "sql",
  },
};

export const Bash: Story = {
  args: {
    text: `#!/bin/bash

# Setup script for development environment
echo "Setting up development environment..."

# Install dependencies
npm install

# Create environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from template"
fi

# Start development server
echo "Starting development server..."
npm run dev`,
    language: "bash",
  },
};

export const PlainText: Story = {
  args: {
    text: `This is a plain text snippet without syntax highlighting.
It can contain any kind of text content, including:
- Configuration files
- Log outputs
- Documentation excerpts
- Error messages

No language is specified, so it will be displayed as plain text.`,
  },
};

export const ShortSnippet: Story = {
  args: {
    text: `console.log("Hello, World!");`,
    language: "javascript",
  },
};

export const LongCode: Story = {
  args: {
    text: `import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchProps {
  onSearch: (query: string) => Promise<any[]>;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchComponent({ onSearch, placeholder = "Search...", debounceMs = 300 }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        {isLoading && <div className="search-loading">Searching...</div>}
      </div>

      {error && (
        <div className="search-error">
          Error: {error}
        </div>
      )}

      <div className="search-results">
        {results.map((result, index) => (
          <div key={index} className="search-result-item">
            {JSON.stringify(result)}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    language: "tsx",
  },
};

export const WithCustomClassName: Story = {
  args: {
    text: `const customComponent = () => {
  return <div>Custom styled snippet</div>;
};`,
    language: "javascript",
    className: "border-2 border-blue-500",
  },
};
