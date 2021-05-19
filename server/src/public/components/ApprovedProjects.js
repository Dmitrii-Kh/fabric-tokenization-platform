
class ApprovedProjects extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: undefined
        };

    }

    handleChange(val) {
        this.setState({projects: val});
    }


    loadPosts() {
        let body = {certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey')};
        if(sessionStorage.getItem('affiliation') === 'systemAdmin') {
            body["validatorUID"] = this.props.validatorUID;
        }
        fetch("/api/v1/platform/getValidatorApprovals", {
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
        if(sessionStorage.getItem('affiliation') === 'validator' || sessionStorage.getItem('affiliation') === 'systemAdmin') {
            this.loadPosts();
            this.interval = setInterval(() => this.loadPosts(), 5000);
        }

    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }



    render() {
        if (sessionStorage.getItem('affiliation') === 'validator' || sessionStorage.getItem('affiliation') === 'systemAdmin') {
            if (this.state.projects) {
                if (this.state.projects.length === 0) {
                    return <div className="no-projects-alert">No approved projects yet!</div>
                }

                return (
                    <div className="approved-projects-container">
                        <h3>Approved projects by {this.props.validatorUID || window.location.href.split('/')[4]}: </h3>
                        {this.state.projects.map((project) => (
                            <div className="approved-project">
                                <div className="approved-project-details">
                                    <span>{project.companyName}, {project.projectName}</span>
                                    <span>{ new Date(Number(project.approvalDate)).toLocaleDateString("en-US")}
                                        {new Date(Number(project.approvalDate)).toLocaleTimeString("en-US")}
                                    </span>
                                </div>
                                <div className="transaction-id-div">Transaction ID: {project.transactionId}</div>
                            </div>
                        ))}
                    </div>
                );

            } else {
                return <div>Please wait</div>;
            }
        } else {
            return <span></span>
        }
    }
}


// ReactDOM.render(<ApprovedProjects/>, document.getElementsByClassName('flex-container')[0]);