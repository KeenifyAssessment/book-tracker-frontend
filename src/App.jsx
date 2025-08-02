import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_API_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        status: 'reading'
    });
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user && session) {
            fetchBooks();
        }
    }, [user, session, statusFilter]);

    const fetchBooks = async () => {
        try {
            const token = session.access_token;
            const url = statusFilter
                ? `${apiUrl}/books?status_filter=${statusFilter}`
                : `${apiUrl}/books`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBooks(data);
            } else {
                console.error('Failed to fetch books');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleSignUp = async (email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) alert(error.message);
        else alert('Check your email for the confirmation link!');
    };

    const handleSignIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) alert(error.message);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) alert(error.message);
        else {
            setBooks([]);
            setBookForm({ title: '', author: '', status: 'reading' });
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!bookForm.title || !bookForm.author) return;

        try {
            const token = session.access_token;
            const response = await fetch(`${apiUrl}/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookForm),
            });

            if (response.ok) {
                setBookForm({ title: '', author: '', status: 'reading' });
                fetchBooks();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to add book');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const token = session.access_token;
            const response = await fetch(`${apiUrl}/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchBooks();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book');
        }
    };

    const handleUpdateStatus = async (bookId, newStatus) => {
        try {
            const token = session.access_token;
            const response = await fetch(`${apiUrl}/books/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchBooks();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to update book');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Failed to update book');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />;
    }

    return (
        <div className="app">
            <header className="header">
                <h1>📚 Book Tracker</h1>
                <div className="user-info">
                    <span>Welcome, {user.email}</span>
                    <button onClick={handleSignOut} className="btn-secondary">
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="main">
                <section className="add-book-section">
                    <h2>Add New Book</h2>
                    <form onSubmit={handleAddBook} className="book-form">
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Book Title"
                                value={bookForm.title}
                                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Author"
                                value={bookForm.author}
                                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                required
                            />
                            <select
                                value={bookForm.status}
                                onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                            >
                                <option value="reading">Reading</option>
                                <option value="completed">Completed</option>
                                <option value="wishlist">Wishlist</option>
                            </select>
                            <button type="submit" className="btn-primary">
                                Add Book
                            </button>
                        </div>
                    </form>
                </section>

                <section className="books-section">
                    <div className="books-header">
                        <h2>My Books ({books.length})</h2>
                        <div className="filter-controls">
                            <label>Filter by status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Books</option>
                                <option value="reading">Reading</option>
                                <option value="completed">Completed</option>
                                <option value="wishlist">Wishlist</option>
                            </select>
                        </div>
                    </div>

                    {books.length === 0 ? (
                        <div className="empty-state">
                            <p>No books found. Add your first book above!</p>
                        </div>
                    ) : (
                        <div className="books-grid">
                            {books.map((book) => (
                                <div key={book.id} className="book-card">
                                    <div className="book-info">
                                        <h3>{book.title}</h3>
                                        <p className="author">by {book.author}</p>
                                        <div className="book-meta">
                                            <select
                                                value={book.status}
                                                onChange={(e) => handleUpdateStatus(book.id, e.target.value)}
                                                className={`status-badge status-${book.status}`}
                                            >
                                                <option value="reading">Reading</option>
                                                <option value="completed">Completed</option>
                                                <option value="wishlist">Wishlist</option>
                                            </select>
                                            <span className="date">
                        Added {new Date(book.created_at).toLocaleDateString()}
                      </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="delete-btn"
                                        title="Delete book"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function AuthForm({ onSignIn, onSignUp }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignUp) {
            onSignUp(email, password);
        } else {
            onSignIn(email, password);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>📚 Book Tracker</h1>
                <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="link-btn"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default App;