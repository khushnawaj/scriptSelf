import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getAllNotes, getSharedNotes } from '../features/notes/noteSlice';
import { getCategories } from '../features/categories/categorySlice';
import EngineeringLanding from '../components/EngineeringLanding';
import { getReputationTier } from '../utils/reputation';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notes, sharedNotes, isLoading: notesLoading } = useSelector((state) => state.notes);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getAllNotes());
        dispatch(getSharedNotes());
        dispatch(getCategories());
    }, [dispatch]);

    if (notesLoading) return <Spinner />;

    const userNotes = notes.filter(n => (n.user?._id || n.user) === user?._id);
    const tier = getReputationTier(user?.reputation || 0);

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <div className="max-w-[1300px] mx-auto px-6 py-8">
                <EngineeringLanding notes={userNotes} sharedNotes={sharedNotes} user={user} tier={tier} navigate={navigate} />
            </div>
        </div>
    );
};

export default Dashboard;
