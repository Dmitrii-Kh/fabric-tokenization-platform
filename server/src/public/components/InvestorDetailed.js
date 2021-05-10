function DepositInvestorMenu(props) {
    //system admin only
    if (sessionStorage.getItem('affiliation') === 'systemAdmin') {
        return (
            <div className="create-new-project-container deposit-investor-btn">
                <button className="collapsible collapsible-proj-detailed" onClick={() => {
                    document.getElementsByClassName("collapsible")[0].classList.toggle("active");
                    const content = document.getElementsByClassName("collapsible-project-adding")[0];
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                }
                }>Deposit
                </button>
                <div className="collapsible-project-adding">
                    <form className="create-project-form" onSubmit={async (e) => {
                        e.preventDefault();
                        try {

                            const depositCurrency = document.getElementById("deposit-investor-currency").value;
                            const depositAmount = document.getElementById("deposit-investor-amount").value;

                            let body = {
                                certificate: sessionStorage.getItem('cert'),
                                privateKey: sessionStorage.getItem('prKey'),
                                investorFullName: props.investorFullName,
                                currency: depositCurrency,
                                amount: depositAmount
                            };


                            const response = await fetch('/api/v1/platform/depositInvestor', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(body)
                            });

                            const responseObj = await response.json();
                            if (responseObj.message) {
                                alert(responseObj.message);
                                console.log(responseObj.error);
                            } else {
                                alert('Success!');
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>
                        <input type="text" id="deposit-investor-currency" name="deposit-investor-currency" min="0"
                               placeholder="Currency " required/>
                        <input type="number" id="deposit-investor-amount" name="deposit-investor-amount" min="0"
                               placeholder="Amount " required/>

                        <button className="create-new-project-btn" type="submit" id="create-new-project-btn">Submit
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return <span/>
}


function InvestMenu(props) {
    //system admin only
    if (sessionStorage.getItem('affiliation') === 'systemAdmin') {
        return (
            <div className="create-new-project-container deposit-investor-btn">
                <button className="collapsible collapsible-proj-detailed" onClick={() => {
                    document.getElementsByClassName("collapsible")[0].classList.toggle("active");
                    const content = document.getElementsByClassName("collapsible-project-adding")[1];
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                }
                }>Invest
                </button>
                <div className="collapsible-project-adding">
                    <form className="create-project-form" onSubmit={async (e) => {
                        e.preventDefault();
                        try {

                            const depositCurrency = document.getElementById("withdraw-investor-currency").value;
                            const depositAmount = document.getElementById("withdraw-investor-amount").value;

                            let body = {
                                certificate: sessionStorage.getItem('cert'),
                                privateKey: sessionStorage.getItem('prKey'),
                                investorFullName: props.investorFullName,
                                currency: depositCurrency,
                                amount: depositAmount
                            };


                            const response = await fetch('/api/v1/platform/investToProject', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(body)
                            });

                            const responseObj = await response.json();
                            if (responseObj.message) {
                                alert(responseObj.message);
                                console.log(responseObj.error);
                            } else {
                                alert('Success!');
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>
                        <input type="text" id="withdraw-investor-currency" name="deposit-investor-currency" min="0"
                               placeholder="Currency " required/>
                        <input type="number" id="withdraw-investor-amount" name="deposit-investor-amount" min="0"
                               placeholder="Amount " required/>

                        <button className="create-new-project-btn" type="submit" id="create-new-project-btn">Submit
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    return <span/>
}


function InvestorPortfolio(props) {

    const affiliation = sessionStorage.getItem("affiliation");
    if (affiliation === 'systemAdmin') {
        return (
            <div className="wallet-info detailed-investor-portfolio">
                <h3>Portfolio</h3>
                <div className="portfolio">
                    <Portfolio investorFullName={props.investorFullName}/>
                </div>
            </div>
        );
    }
    return <span/>
}

class InvestorDetailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            investorFullName: undefined
        };

    }

    handleChange(val) {
        this.setState({investorFullName: val});
    }


    componentDidMount() {
        this.handleChange(window.location.href.split('/')[5]);
    }


    render() {
        if (this.state.investorFullName) {

            return (

                <div className="investor-detailed-container">

                    <InvestorPortfolio
                        investorFullName={this.state.investorFullName}
                    />
                    <div className="btn-row">
                        <DepositInvestorMenu
                            investorFullName={this.state.investorFullName}
                        />
                        <InvestMenu
                            investorFullName={this.state.investorFullName}
                        />
                    </div>


                </div>

            );
        } else {
            return <div>Please wait</div>;
        }
    }
}


ReactDOM.render(<InvestorDetailed/>, document.getElementsByClassName('main-section')[0]);
