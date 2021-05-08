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
        switch (sessionStorage.getItem('affiliation')) {
            case 'investor':
                url = `/api/v1/platform/getInvestorWallet`
                break;
            case 'validator':
                url = `/api/v1/platform/getValidatorWallet`
                break;
            case 'company':
                url = `` //todo summary investments
                break;
            default:
                break;
        }

        fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey')})
        })
            .then((res) => res.json())
            .then((res) => {
                this.handleChange(res);
                console.log(res)
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