function DepositProjectMenu(props) {
    //company only
    if (sessionStorage.getItem('affiliation') === 'company') {
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

function UploadDocsBtn(props) {
    //company
    return (
        <form className="project-detailed-btn-container" method="post" action="/uploadDocs" encType="multipart/form-data">
            <label className="upload-docs-label" htmlFor="uploadDocs">Select Docs
                <input type="file" id="uploadDocs" name="uploadDocs" placeholder="Docs"/>
            </label>
            <input type="text" id="uploadDocsCompany" style={{display: "none"}} name="uploadDocsCompany"
                   value={props.companyName}/>
            <input type="text" id="uploadDocsProject" style={{display: "none"}} name="uploadDocsProject"
                   value={props.projectName}/>
            <input className="upload-download-input" type="submit" value="Upload"/>
        </form>
    )
}

function DownloadDocsBtn(props) {
    let newBlob;

    function showFile(blob){
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        newBlob = new Blob([blob], {type: "application/pdf"})

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
        link.download = props.companyName + props.projectName + ".pdf";
        link.click();

        setTimeout(function(){
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
        }, 100);
    }

        return (
            <button className="detailed-proj-btn" onClick={async (e) => {
                e.preventDefault();
                const response = await fetch('/getDocs', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({companyName: props.companyName, projectName: props.projectName})
                });

                const responseObj = await response.blob();
                if(responseObj) {
                    showFile(responseObj);
                }
                // if (responseObj.message) {
                //     alert(responseObj.message);
                //     console.log(responseObj.error);
                // } else {
                //     alert('Success!');
                // }

            }}>Download Docs</button>
        )
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
    if (sessionStorage.getItem("affiliation") === 'validator' && (props.approved === false || props.approved === "false")) {
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
        this.pdfSrc = undefined;
        this.pdfVisibility = "hidden";
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
        if (sessionStorage.getItem('affiliation') !== 'company') {
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


    async componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 4000);

        await this.loadDocs();
    }


    async loadDocs() {
        const response = await fetch('/getDocs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({companyName: window.location.href.split('/')[4], projectName: window.location.href.split('/')[5]})
        });

        const responseObj = await response.blob();

        let blob = new Blob([responseObj], {type: "application/pdf"});
        if(blob.size > 1000) {
            this.pdfSrc = window.URL.createObjectURL(blob);
            this.pdfVisibility = "visible";
        }
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
                    <UploadDocsBtn
                        projectName={this.state.project.projectName}
                        companyName={this.state.project.companyName}
                    />
                    <div className="project-docs">
                        <DownloadDocsBtn
                            projectName={this.state.project.projectName}
                            companyName={this.state.project.companyName}
                        />
                        <iframe id="pdf-frame" src={this.pdfSrc} style={{visibility: `${this.pdfVisibility}`}} frameBorder="0"/>
                    </div>
                </div>

            );
        } else {
            return <div>Please wait</div>;
        }
    }
}


ReactDOM.render(<ProjectDetailed/>, document.getElementsByClassName('main-section')[0]);
