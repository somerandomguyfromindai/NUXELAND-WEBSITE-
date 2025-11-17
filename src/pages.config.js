import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Timeline from './pages/Timeline';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Shop from './pages/Shop';
import Platformer from './pages/Platformer';
import Map from './pages/Map';
import MissionTimeline from './pages/MissionTimeline';
import Resources from './pages/Resources';
import MerchShop from './pages/MerchShop';
import SellFormula from './pages/SellFormula';
import FormulaRD from './pages/FormulaRD';
import Blog from './pages/Blog';
import Groups from './pages/Groups';
import Leaderboards from './pages/Leaderboards';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Simulator": Simulator,
    "Timeline": Timeline,
    "Dashboard": Dashboard,
    "Community": Community,
    "Shop": Shop,
    "Platformer": Platformer,
    "Map": Map,
    "MissionTimeline": MissionTimeline,
    "Resources": Resources,
    "MerchShop": MerchShop,
    "SellFormula": SellFormula,
    "FormulaRD": FormulaRD,
    "Blog": Blog,
    "Groups": Groups,
    "Leaderboards": Leaderboards,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};