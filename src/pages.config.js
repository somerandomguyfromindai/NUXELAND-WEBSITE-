import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Timeline from './pages/Timeline';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Shop from './pages/Shop';
import Platformer from './pages/Platformer';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Simulator": Simulator,
    "Timeline": Timeline,
    "Dashboard": Dashboard,
    "Community": Community,
    "Shop": Shop,
    "Platformer": Platformer,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};