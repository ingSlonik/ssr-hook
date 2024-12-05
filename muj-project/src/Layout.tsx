import { Link } from "easy-page-router/react";

export default function Layout({ children }: { children: React.ReactNode }) {

    return <div className="layout">
        <nav>
            <div className="content">
                <Link to="/">Aktuality</Link>
                <Link to="/o-nas">O nás</Link>
                <Link to="/uredni-deska">Úřední deska</Link>
                <Link to="/verejne-dokumenty">Veřejné dokumenty</Link>
                <Link to="/projekty">Projekty</Link>
                <Link to="/o-nas/kontakty">Kontakt</Link>
            </div>
        </nav>
        <div className="page-content">
            {children}
        </div>
    </div>;
}
