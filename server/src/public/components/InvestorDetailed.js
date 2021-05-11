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
                               placeholder="Amount " step="0.01" required/>

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
                            const selectedOption = document.getElementById("project-select").value.split(',');
                            const company = selectedOption[0];
                            const project = selectedOption[1];
                            console.log(company)
                            console.log(project)
                            let body = {
                                certificate: sessionStorage.getItem('cert'),
                                privateKey: sessionStorage.getItem('prKey'),
                                investorFullName: props.investorFullName,
                                companyName: company,
                                projectName: project,
                                currency: depositCurrency,
                                amount: depositAmount
                            };


                            const response = await fetch('/api/v1/platform/investToProject', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(body)
                            });

                            const responseObj = await response.blob();
                            // if (responseObj.message) {
                            //     alert(responseObj.message);
                            //     console.log(responseObj.error);
                            // } else {

                            let blob = new Blob([responseObj], {type: "image/jpeg"});
                            if(blob.size > 0) {

                                    // It is necessary to create a new blob object with mime-type explicitly set
                                    // otherwise only Chrome works like it should
                                    let newBlob = new Blob([blob], {type: "image/jpeg"})

                                    // IE doesn't allow using a blob object directly as link href
                                    // instead it is necessary to use msSaveOrOpenBlob
                                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                        window.navigator.msSaveOrOpenBlob(newBlob);
                                        return;
                                    }

                                    // For other browsers:
                                    // Create a link pointing to the ObjectURL containing the blob.
                                    const data = window.URL.createObjectURL(newBlob);
                                    let link = document.createElement('a');
                                    link.href = data;
                                    link.download = props.investorFullName + company + project + ".jpeg";
                                    link.click();

                                    setTimeout(function(){
                                        // For Firefox it is necessary to delay revoking the ObjectURL
                                        window.URL.revokeObjectURL(data);
                                    }, 100);


                                alert('Success!');
                            }
                           // }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>
                        <input type="text" id="withdraw-investor-currency" name="deposit-investor-currency" min="0"
                               placeholder="Currency " required/>
                        <input type="number" id="withdraw-investor-amount" name="deposit-investor-amount" min="0"
                               placeholder="Amount " step="0.01" required/>
                        <select name="project-select" id="project-select">
                            {props.projects.map((project) => (
                                <option value={`${project.companyName},${project.projectName}`}>{project.companyName}, {project.projectName}</option>
                            ))}
                        </select>
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
            projects: undefined,
            investorFullName: undefined
        };

    }

    handleChange(val) {
        this.setState({investorFullName: val});
    }


    componentDidMount() {
        this.handleChange(window.location.href.split('/')[5]);
        fetch("/api/v1/platform/getAllProjects", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey')})
        })
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                this.setState({projects: res});
            });
    }


    render() {
        if (this.state.investorFullName && this.state.projects) {

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
                            projects={this.state.projects}
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
