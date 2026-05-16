import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import MainLayout from './components/layout/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explore from './pages/Explore.jsx';
import MyItems from './pages/MyItems.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import AddItem from './pages/AddItem.jsx';
import Profile from './pages/Profile.jsx';
import Requests from './pages/Requests.jsx';
import Handoff from './pages/Handoff.jsx';
import Gratitude from './pages/Gratitude.jsx';
import Review from './pages/Review.jsx';
import NotFound from './pages/NotFound.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="explore" element={<Explore />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route
          path="profile/me"
          element={
            <Protected>
              <Profile self />
            </Protected>
          }
        />
        <Route path="profile/:id" element={<Profile />} />

        <Route
          path="dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="my-items"
          element={
            <Protected>
              <MyItems />
            </Protected>
          }
        />
        <Route
          path="add-item"
          element={
            <Protected>
              <AddItem />
            </Protected>
          }
        />
        <Route
          path="requests"
          element={
            <Protected>
              <Requests />
            </Protected>
          }
        />
        <Route
          path="handoff/:requestId"
          element={
            <Protected>
              <Handoff />
            </Protected>
          }
        />
        <Route
          path="gratitude/:requestId"
          element={
            <Protected>
              <Gratitude />
            </Protected>
          }
        />
        <Route
          path="review/:requestId"
          element={
            <Protected>
              <Review />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
