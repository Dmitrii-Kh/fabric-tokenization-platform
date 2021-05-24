
class ValidatorsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validators: undefined
        };


    }

    handleChange(val) {
        this.setState({validators: val});
    }


    loadPosts() {

        fetch("/api/v1/platform/getValidators", {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
            .then((res) => res.json())
            .then((res) => {
                this.handleChange(res);
            });

    }

    componentDidMount() {
        this.loadPosts();
        this.interval = setInterval(() => this.loadPosts(), 15000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }


    render() {
        if (this.state.validators) {
            return (

                <div className="investors-container">
                    <h2>Validators: </h2>
                    {this.state.validators.map((validator) => (
                        <a href={`/admin/validators/${validator}`}>{validator}</a>
                    ))}
                </div>

            );
        } else {
            return <div data-text="Please&nbsp;wait..." className="please-wait">Please&nbsp;wait...</div>;
        }
    }
}




ReactDOM.render(<ValidatorsList />, document.getElementsByClassName('main-section')[0]);
