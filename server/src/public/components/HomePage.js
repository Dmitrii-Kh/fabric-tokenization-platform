

function HomePage() {
    return (
        <div className="home-page">
            <div className="wallet-info">
                <div className="portfolio">
                  <Portfolio/>
                </div>
            </div>
            <ApprovedProjects/>
            <InvestmentHistory/>
        </div>
    )

}

ReactDOM.render(<HomePage/>, document.getElementsByClassName('flex-container')[0]);
