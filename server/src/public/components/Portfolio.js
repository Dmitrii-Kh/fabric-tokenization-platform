class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: [],
        };
    }

    handleChange(val) {
        this.setState({wallet: val});
    }


    loadPosts() {
        let url;
        let body = {certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey')};
        switch (sessionStorage.getItem('affiliation')) {
            case 'investor':
                url = `/api/v1/platform/getInvestorWallet`
                break;
            case 'validator':
                url = `/api/v1/platform/getValidatorWallet`
                break;
            case 'company':
                url = `/api/v1/platform/getProjectWallet`
                // body['projectName'] = window.location.href.split('/')[5];
                body['projectName'] = this.props.projectName;
                break;
            case 'systemAdmin':
                if(window.location.href.indexOf('/projects/')> -1) {
                    url = `/api/v1/platform/getProjectWallet`
                    // body['companyName'] = window.location.href.split('/')[4];
                    // body['projectName'] = window.location.href.split('/')[5];
                    body['companyName'] = this.props.companyName;
                    body['projectName'] = this.props.projectName;
                } else if(window.location.href.indexOf('/admin/investors/')> -1){
                    url = `/api/v1/platform/getInvestorWallet`
                    // body['investorFullName'] = window.location.href.split('/')[5];
                    body['investorFullName'] = this.props.investorFullName;
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
        this.interval = setInterval(() => this.loadPosts(), 25000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if (this.state.wallet) {
            return (

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

            );
        } else {
            return <div>Please wait</div>;
        }
    }
}


ReactDOM.render(<Portfolio/>, document.getElementsByClassName('portfolio')[0]);