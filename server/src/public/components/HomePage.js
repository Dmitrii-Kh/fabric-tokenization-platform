

function HomePage() {
    return (
        <div className="home-page">
            <div className="wallet-info">
                <div className="portfolio">
                  <Portfolio/>
                </div>
            </div>
            <ApprovedProjects/>
        </div>
    )

}

ReactDOM.render(<HomePage/>, document.getElementsByClassName('flex-container')[0]);
