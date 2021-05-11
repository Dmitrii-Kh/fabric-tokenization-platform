
function LogOut() {
        return (
            <nav>
                <a href="/signin" onClick={() => {
                    sessionStorage.clear();
                }}>Log out</a>
            </nav>
        )
}


function UserNav() {
    let url = ""
    const cn = sessionStorage.getItem('commonName');
    switch(sessionStorage.getItem('affiliation')) {
        case 'investor':
            url = `investors/${cn}`
            break;
        case 'validator':
            url = `validators/${cn}`
            break;
        case 'systemAdmin':
            url = `admin`
            break;
        case 'company':
            url = `companies/${cn}`
            break;
        default:
            break;
    }
    if(sessionStorage.getItem('affiliation') === 'systemAdmin') {
        return (
            <nav>
                <a href={`/${url}/investors`}>Investors</a>
                <a href="/projects">Projects</a>
                <a href={`/${url}/validators`}>Validators</a>
            </nav>
        )
    }

    return (
        <nav>
            <a href={`/${url}`}>Home</a>
            <a href="/projects">Projects</a>
        </nav>
    )

}


function Navbar() {

        return (
            <div className="navbar-content">
                <div className="navbar-menu">
                   <UserNav/>
                </div>
                <div id="registerMenu" className="register-menu">
                    <h4 id="user-name">{sessionStorage.getItem('commonName')}<i className="fab fa-react"/></h4>
                    <LogOut/>
                </div>
            </div>
        );

}


ReactDOM.render(<Navbar />, document.getElementById("navbar"));
