
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
                            const projectEmission = document.getElementById("project-emission").value;
                            const description = document.getElementById("new-project-description").value;
                            const tokenName = document.getElementById("project-token-name").value;
                            const priceInUSDT = document.getElementById("project-token-price").value;


                            const response = await fetch('/api/v1/platform/createNewProject', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({certificate: sessionStorage.getItem('cert'), privateKey: sessionStorage.getItem('prKey'),
                                    projectName: projectName, projectDescription: description, emission: projectEmission, tokenName: tokenName, priceInUSDT: priceInUSDT})
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
                        <input type="text" id="project-emission" name="project-emission" placeholder="Emission " required/>
                        <input type="text" id="project-token-name" name="project-token-name" placeholder="Token Name " required/>
                        <input type="number" id="project-token-price" name="project-token-price" min="0" placeholder="Price in USDT " required/>
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
            title: 'title',
            price: 'price',
            startDate: 'startDate'
        }

        this.last_sort_key = "AZ"
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
                    //this.sortArr(this.last_sort_key);
                });

    }


    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 3000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    sortArr = (val) => {
        const {title, price, startDate} = this.sortKey;
        const sorted = this.state.projects.sort((a, b) => {
            let key;
            switch(val) {
                case "CheapToExpensive":
                    key = price;
                    return parseInt(a[key]) - parseInt(b[key]);
                case "ExpensiveToCheap":
                    key = price;
                    return parseInt(b[key]) - parseInt(a[key]);
                case "DateAsc":
                    key = startDate;
                    return new Date(a[key]) - new Date(b[key]);
                case "DateDesc":
                    key = startDate;
                    return new Date(b[key]) - new Date(a[key]);
                case "AZ":
                    key = title;
                    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
                case "ZA":
                    key = title;
                    return a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0;
            }
        })
        this.handleChange(sorted);
    }


    render() {
        if (this.state.projects) {
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
                            <option value="CheapToExpensive">Cheap to Expensive</option>
                            <option value="ExpensiveToCheap">Expensive to Cheap</option>
                            <option value="DateAsc">Earliest First</option>
                            <option value="DateDesc">Latest First</option>
                            <option value="AZ">A-Z</option>
                            <option value="ZA">Z-A</option>
                        </select>
                    </div>
                    {this.state.projects.map((project) => (
                        <Project
                            companyName = { project.companyName }
                            projectName = { project.projectName }
                            projectDescription = { project.projectDescription }
                            emission = { project.emission }
                            tokenName = { project.tokenName }
                            priceInUSDT = { project.priceInUSDT }
                            approved = { project.approved }
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
