function DepositProjectMenu(props) {
    //system admin only
    if (sessionStorage.getItem('affiliation') === 'systemAdmin') {
        return (
            <div className="create-new-project-container deposit-project-btn">
                <button className="collapsible" onClick={() => {
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

                            const depositCurrency = document.getElementById("deposit-project-currency").value;
                            const depositAmount = document.getElementById("deposit-project-amount").value;

                            let body = {
                                certificate: sessionStorage.getItem('cert'),
                                privateKey: sessionStorage.getItem('prKey'),
                                companyName: props.companyName,
                                projectName: props.projectName,
                                currency: depositCurrency,
                                amount: depositAmount
                            };

                            if (sessionStorage.getItem('affiliation') === 'systemAdmin') {
                                body['companyName'] = props.companyName;
                            }


                            const response = await fetch('/api/v1/platform/depositCompanyProject', {
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
                        <input type="text" id="deposit-project-currency" name="deposit-project-currency" min="0"
                               placeholder="Currency " required/>
                        <input type="number" id="deposit-project-amount" name="deposit-project-amount" min="0"
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

function UploadDocsBtn() {
    //company
}

function DownloadDocsBtn() {
    //investor
}

function ProjectPortfolio(props) {
    //admin + company
    const affiliation = sessionStorage.getItem("affiliation");
    if (affiliation === 'systemAdmin' || affiliation === 'company') {
        return (
            <div className="wallet-info detailed-project-portfolio">
                <div className="portfolio">
                    <Portfolio projectName={props.projectName} companyName={props.companyName}/>
                </div>
            </div>
        );
    }
    return <span/>
}

function ApproveBtn(props) {
    //validator
    if(sessionStorage.getItem("affiliation") === 'validator' && (props.approved === false || props.approved === "false")){
        let body = {
            certificate: sessionStorage.getItem('cert'),
            privateKey: sessionStorage.getItem('prKey'),
            companyName: props.companyName,
            projectName: props.projectName
        };
     return (
         <button className="detailed-proj-btn" onClick={async (e) => {
             const response = await fetch('/api/v1/platform/approveProject', {
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
         }}>Approve Project</button>
     )
    }
    return <span></span>
}

class ProjectDetailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: undefined
        };

    }

    handleChange(val) {
        this.setState({project: val});
    }


    loadPosts() {
        let body = {
            certificate: sessionStorage.getItem('cert'),
            privateKey: sessionStorage.getItem('prKey'),
            projectName: window.location.href.split('/')[5]
        }
        if(sessionStorage.getItem('affiliation') !== 'company') {
            body["companyName"] = window.location.href.split('/')[4];
        }

        fetch("/api/v1/platform/getProject", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then((res) => res.json())
            .then((res) => {
                this.handleChange(res);
                console.log(res)

            });

    }


    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 4000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if (this.state.project) {

            return (

                <div className="project-detailed-container">
                    <ProjectPortfolio
                        projectName={this.state.project.projectName}
                        companyName={this.state.project.companyName}
                    />
                    <DepositProjectMenu
                        projectName={this.state.project.projectName}
                        companyName={this.state.project.companyName}
                    />
                    <ApproveBtn
                        projectName={this.state.project.projectName}
                        companyName={this.state.project.companyName}
                        approved={this.state.project.approved}
                    />
                    <div className="project-docs"></div>
                </div>

            );
        } else {
            return <div>Please wait</div>;
        }
    }
}


ReactDOM.render(<ProjectDetailed/>, document.getElementsByClassName('main-section')[0]);
