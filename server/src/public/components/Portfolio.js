
function Header(){
    if(sessionStorage.getItem('affiliation') === 'validator') {
        return <h3>Balance</h3>
    } else if (sessionStorage.getItem('affiliation') === 'company' && window.location.href.indexOf('/companies/') > -1) {
        return <h3><b>{sessionStorage.getItem('commonName')}</b> total investments: </h3>
    } else {
        return <h3>Portfolio</h3>
    }
}

class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: undefined,
        };
    }

    handleChange(val) {
        this.setState({wallet: val});
    }


    loadPosts() {
        let url;
        let body = {};
        switch (sessionStorage.getItem('affiliation')) {
            case 'investor':
                url = `/api/v1/platform/getInvestorWallet`
                break;
            case 'validator':
                url = `/api/v1/platform/getValidatorWallet`
                break;
            case 'company':
                if(window.location.href.indexOf('/companies/') > -1) {
                    url = `/api/v1/platform/getCompanyTotalInvestments`
                } else {
                    url = `/api/v1/platform/getProjectWallet`
                    body['projectName'] = this.props.projectName;
                }
                break;
            case 'systemAdmin':
                if (window.location.href.indexOf('/projects/') > -1) {
                    url = `/api/v1/platform/getProjectWallet`
                    body['companyUID'] = this.props.companyUID;
                    body['projectName'] = this.props.projectName;
                } else if (window.location.href.indexOf('/admin/investors/') > -1) {
                    url = `/api/v1/platform/getInvestorWallet`
                    body['investorUID'] = this.props.investorUID;
                }
                break;
            default:
                break;
        }
        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then((res) => res.json())
            .then((res) => {
                this.handleChange(res);
            });
    }


    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if (this.state.wallet) {
            if (this.state.wallet.length === 0) {
                return (
                    <div>
                        <table className="table table-hover wallet-table">
                            <tbody>
                            <tr>
                                <th>Currency</th>
                                <th>Amount</th>
                            </tr>
                            </tbody>
                        </table>
                        <div className="empty-portfolio-alert">Portfolio is empty</div>
                    </div>
                )
            }
            return (
                        <div className="portfolio">
                            <Header/>
                            <table className="table table-hover wallet-table">
                                <tbody>
                                <tr>
                                    <th>Currency</th>
                                    <th>Amount</th>
                                </tr>
                                {this.state.wallet.map((record) => (
                                    <tr>
                                        <td>{record.currencyName}</td>
                                        <td>{record.amount}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>


            );
        } else {
            return <div data-text="Please&nbsp;wait..." className="please-wait">Please&nbsp;wait...</div>;
        }
    }
}


// ReactDOM.render(<Portfolio/>, document.getElementsByClassName('portfolio')[0]);