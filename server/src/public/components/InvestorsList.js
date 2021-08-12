
class InvestorsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            investors: undefined
        };


    }

    handleChange(val) {
        this.setState({investors: val});
    }


    loadPosts() {

        fetch("/api/v1/platform/getInvestors", {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
            .then((res) => res.json())
            .then((res) => {
                this.handleChange(res);
                console.log(res)
                //this.sortArr(this.last_sort_key);
            });

    }


    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 15000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if (this.state.investors) {
            return (

                <div className="investors-container">
                    <h2>Investors: </h2>
                    {this.state.investors.map((investor) => (
                        <a href={`/admin/investors/${investor.investorUID}`}>{investor.investorFullName} ({investor.investorUID})</a>
                    ))}
                </div>

            );
        } else {
            return <div data-text="Please&nbsp;wait..." className="please-wait">Please&nbsp;wait...</div>;
        }
    }
}




ReactDOM.render(<InvestorsList />, document.getElementsByClassName('main-section')[0]);
