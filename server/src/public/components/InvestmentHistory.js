
class InvestmentHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            records: undefined
        };

    }

    handleChange(val) {
        this.setState({records: val});
    }


    loadPosts() {
        if(sessionStorage.getItem('affiliation') === 'company') {
            fetch("/api/v1/platform/getInvestmentHistory", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    certificate: sessionStorage.getItem('cert'),
                    privateKey: sessionStorage.getItem('prKey')
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    this.handleChange(res);
                    console.log(res)
                });
        }
    }


    componentDidMount() {
        if(sessionStorage.getItem('affiliation') === 'company') {
            this.loadPosts();
            this.interval = setInterval(() => this.loadPosts(), 5000);
        }

    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }



    render() {
        if (sessionStorage.getItem('affiliation') === 'company') {
            if (this.state.records) {
                if (this.state.records.length === 0) {
                    return <div className="no-projects-alert">No approved projects yet!</div>
                }

                return (
                    <div className="invest-history-container">
                        <h3>Investment history</h3>
                        {this.state.records.map((record) => (
                            <div className="invest-history-record">
                                <div className="invest-history-record-details">
                                    <span>{record.investorFullName}</span>
                                    <span>
                                        {record.amount} {record.currency}
                                    </span>
                                    <span>{ new Date(Number(record.timestamp)).toLocaleDateString("en-US")} {new Date(Number(record.timestamp)).toLocaleTimeString("en-US")}
                                    </span>
                                </div>
                                <div className="transaction-id-div">Transaction ID: {record.transactionId}</div>
                            </div>
                        ))}
                    </div>
                );

            } else {
                return <div data-text="Please&nbsp;wait..." className="please-wait">Please&nbsp;wait...</div>;
            }
        } else {
            return <span></span>
        }
    }
}


// ReactDOM.render(<ApprovedProjects/>, document.getElementsByClassName('flex-container')[0]);