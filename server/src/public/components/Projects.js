
function AddProjectMenu() {
    if(sessionStorage.getItem('affiliation') === 'company') {
        return (
            <div className="create-new-project-container">
                <button className="collapsible" onClick={ () => {
                    document.getElementsByClassName("collapsible")[0].classList.toggle("active");
                    const content = document.getElementsByClassName("collapsible-project-adding")[0];
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                }
                }>Create New Project</button>
                <div className="collapsible-project-adding">
                    <form className="create-project-form" onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const projectName = document.getElementById("project-name").value;
                            const totalSupply = document.getElementById("project-totalSupply").value;
                            const description = document.getElementById("new-project-description").value;
                            const tokenName = document.getElementById("project-token-name").value;
                            const priceInUSDT = document.getElementById("project-token-price").value;


                            const response = await fetch('/api/v1/platform/createNewProject', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey'),
                                    projectName: projectName, projectDescription: description, totalSupply: totalSupply, tokenName: tokenName, priceInUSDT: priceInUSDT})
                            });

                            const responseObj = await response.json();
                            if (responseObj.message) {
                                alert(responseObj.message);
                                console.log(responseObj.error);
                            } else {
                                alert('Project created successfully!');
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>
                        <input type="text" id="project-name" name="project-name" placeholder="Project Name " required/>
                        <input type="text" id="project-totalSupply" name="project-totalSupply" placeholder="Total Supply " required/>
                        <input type="text" id="project-token-name" name="project-token-name" placeholder="Token Name " required/>
                        <input type="number" id="project-token-price" name="project-token-price" min="0" step="0.01" placeholder="Price in USDT " required/>
                        <textarea name="new-project-description" id="new-project-description" placeholder="Description" required/>

                        <button className="create-new-project-btn" type="submit" id="create-new-project-btn">Submit</button>
                    </form>
                </div>
            </div>
        );
    }
    return <div/>
}

class Projects extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: undefined
        };

        this.sortKey = {
            companyName: 'companyName',
            projectName: 'projectName',
            totalSupply: 'totalSupply',
            supply: 'supply',
            priceInUSDT: 'priceInUSDT',
            approved: 'approved'
        }

        this.last_sort_key = "companyName"
    }

    handleChange(val) {
        this.setState({projects: val});
    }


    loadPosts() {

            fetch("/api/v1/platform/getAllProjects", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey')})
            })
                .then((res) => res.json())
                .then((res) => {
                    this.handleChange(res);
                    console.log(res)
                    this.sortArr(this.last_sort_key);
                });

    }


    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 4000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    sortArr = (val) => {
        const {companyName, projectName, totalSupply, supply, priceInUSDT, approved} = this.sortKey;
        const sorted = this.state.projects.sort((a, b) => {
            let key;
            switch(val) {
                case "compNameAZ":
                    key = companyName;
                    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
                case "compNameZA":
                    key = companyName;
                    return a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0;
                case "projNameAZ":
                    key = projectName;
                    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
                case "projNameZA":
                    key = projectName;
                    return a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0;
                case "totalSupplyASC":
                    key = totalSupply;
                    return parseInt(a[key]) - parseInt(b[key]);
                case "totalSupplyDESC":
                    key = totalSupply;
                    return parseInt(b[key]) - parseInt(a[key]);
                case "supplyASC":
                    key = supply;
                    return parseInt(a[key]) - parseInt(b[key]);
                case "supplyDESC":
                    key = supply;
                    return parseInt(b[key]) - parseInt(a[key]);
                case "priceASC":
                    key = priceInUSDT;
                    return parseInt(a[key]) - parseInt(b[key]);
                case "priceDESC":
                    key = priceInUSDT;
                    return parseInt(b[key]) - parseInt(a[key]);
                case "approvedFirst":
                    key = approved;
                    return a[key].toString() > b[key].toString() ? -1 : a[key].toString() < b[key].toString() ? 1 : 0;
                case "notApprovedFirst":
                    key = approved;
                    return a[key].toString() < b[key].toString() ? -1 : a[key].toString() > b[key].toString() ? 1 : 0;
            }
        })
        this.handleChange(sorted);
    }


    render() {
        if (this.state.projects) {
            if (this.state.projects.length === 0) {
                return (
                    <div>
                        <AddProjectMenu/>
                        <div className="no-projects-alert">No projects yet!</div>
                    </div>
                )
            }

            return (

                <div className="projects-container">
                    <AddProjectMenu/>
                    <div className="sort-bar">
                        <select name="sort-select" id="sort-select" onChange={ () => {
                            const select = document.getElementById('sort-select');
                            const sv = select.value;
                            this.last_sort_key = sv;
                            this.sortArr(sv)
                        }}>
                            <option value="compNameAZ">Company Name A-Z</option>
                            <option value="compNameZA">Company Name Z-A</option>
                            <option value="projNameAZ">Project Name A-Z</option>
                            <option value="projNameZA">Project Name Z-A</option>
                            <option value="totalSupplyASC">Total Supply by ASC</option>
                            <option value="totalSupplyDESC">Total Supply by DESC</option>
                            <option value="supplyASC">Supply by ASC</option>
                            <option value="supplyDESC">Supply by DESC</option>
                            <option value="priceASC">Price by ASC</option>
                            <option value="priceDESC">Price by DESC</option>
                            <option value="approvedFirst">Approved First</option>
                            <option value="notApprovedFirst">Not Approved First</option>
                        </select>
                    </div>
                    {this.state.projects.map((project) => (
                        <Project
                            companyUID = { project.companyUID }
                            companyName = { project.companyName }
                            projectName = { project.projectName }
                            projectDescription = { project.projectDescription }
                            totalSupply = { project.totalSupply }
                            supply = { project.supply }
                            tokenName = { project.tokenName }
                            priceInUSDT = { project.priceInUSDT }
                            approved = { project.approved }
                            approvedBy = { project.approvedBy }
                        />
                    ))}
                </div>

            );
        } else {
            return <div>Please wait</div>;
        }
    }
}




ReactDOM.render(<Projects />, document.getElementsByClassName('main-section')[0]);
