import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home page
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-dark text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-2">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;
