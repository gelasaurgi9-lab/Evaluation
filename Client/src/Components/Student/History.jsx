import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { FaBook, FaClipboardCheck, FaGraduationCap, FaSearch, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvaluationsByStudent } from '../../Store/EvaluationSlice';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  
  // Get evaluations from Redux store
  const { evaluations, status, error: fetchError } = useSelector(
    (state) => state.evaluations
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current user's ID from your auth state
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.id) {
          await dispatch(fetchEvaluationsByStudent(user.id));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load evaluation history');
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Transform evaluation data to match our component's needs
  const transformEvaluationData = (evaluations) => {
    if (!evaluations) return [];
    
    return evaluations.map(evalItem => ({
      id: evalItem._id || evalItem.id,
      title: evalItem.title || 'Evaluation',
      type: evalItem.type?.toLowerCase() || 'evaluation',
      date: evalItem.createdAt || new Date().toISOString(),
      score: evalItem.score ? `${evalItem.score}/100` : 'Pending',
      status: evalItem.status === 'completed' ? 'completed' : 'in-progress',
      courseCode: evalItem.courseCode || '',
    }));
  };

  const historyData = transformEvaluationData(evaluations);

  const filteredHistory = historyData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.courseCode && item.courseCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <FaClipboardCheck className="history-icon quiz" />;
      case 'assignment':
        return <FaBook className="history-icon assignment" />;
      case 'project':
        return <FaGraduationCap className="history-icon project" />;
      default:
        return <FaBook className="history-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading evaluation history...</p>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div className="error-container">
        <p>Error: {error || fetchError}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Evaluation History</h2>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search evaluations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={loading}
          />
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-icon-container">
                {getIcon(item.type)}
              </div>
              <div className="history-details">
                <h3>{item.title}</h3>
                <div className="history-meta">
                  <span className={`status ${item.status}`}>
                    {item.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  <span className="date">
                    {format(parseISO(item.date), 'MMM dd, yyyy')}
                  </span>
                  {item.courseCode && (
                    <span className="course-code">
                      {item.courseCode}
                    </span>
                  )}
                </div>
              </div>
              <div className="history-score">
                <span className={`score ${item.status}`}>
                  {item.score}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No evaluations found{searchTerm ? ` for "${searchTerm}"` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;