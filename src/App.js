import React from 'react';
import { Row, Col, Jumbotron, Button, Form, FormGroup, FormControl, ControlLabel, Alert } from 'react-bootstrap';

class App extends React.Component {
    render() {
        return (
            <div className="container">
                <Header title="Игра &laquo;Слова&raquo;" />

                <Game />

                <Footer />
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div className="header clearfix">
                <h3 className="text-muted">{ this.props.title }</h3>
            </div>
        )
    }
}

class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <p>&copy; 2017 ПАО &quot;Словарные игры&quot;</p>
            </footer>
        );
    }
}

class Task extends React.Component {
    render() {
        return (
            <Jumbotron>
                <h1>{ this.props.task }</h1>
                <p className="small">Ваша задача - составить как можно больше слов из букв слова-задания.</p>
                <Button onClick={ this.props.newTask } bsSize="xsmall" >
                    хочу другое задание
                </Button>
            </Jumbotron>
        );
    }
}

class InputArea extends React.Component {
    render() {
        let disabled = (this.props.enteredWord.length < 2) ? true : false;
        
        return (
            <Form horizontal onSubmit={ this.submit.bind(this) }>
                <FormGroup controlId="playerWord">
                    <Col sm={3}>
                        <ControlLabel className="pull-right">Введите слово: </ControlLabel>
                    </Col>

                    <Col sm={7}>
                        <FormControl type="text" placeholder="слово, состоящее из букв слова-задания" value={this.props.enteredWord} onChange={this.change.bind(this)} />
                    </Col>

                    <Col sm={2}>
                        <Button type="submit" className="btn-success" disabled={disabled}>
                            ok
                        </Button>
                    </Col>
                </FormGroup>
                <WordError isVisible={ this.props.showError } errorText={ this.props.errorText } />
            </Form>
        )
    }

    change(event) {
        this.props.onChangeWord(event, event.target.value.toUpperCase());
    }

    submit(event) {
        this.props.checkWord(event, this.props.enteredWord);
    }
}

class Game extends React.Component {
    constructor() {
        super();

        this.state = {
            task: '',
            enteredWord: '',
            enteredWords: [],
            showError: false,
            errorText: ''
        }

        this.newTask();
    }

    newTask() {
        fetch('/tasks.json').then( res => {
            res.json().then(data => {
                
                this.setState({
                    task: data[Math.floor(Math.random() * data.length)],
                    enteredWords: [],
                    showError: false
                });

            });
        });
    }

    lettersCount(word) {
        let result = {};
        
        word.split('').forEach((val, i) => {
            if (!(val in result)) {
                result[val] = 0;
            }

            result[val]++;
        });

        return result;
    }
    
    wordCanBeAssembled(word, task) {
        // введенное слово больше, чем задание
        if (word.length > task.length) {
            return false;
        }

        let enteredWordLetters = this.lettersCount(word);
        let taskLetters = this.lettersCount(task);

        for (let k in enteredWordLetters) {
            // одной из букв в введенном слове нет в задании вообще
            if (!(k in taskLetters)) {
                return false;
            }

            // буква в введенном слове встречается чаще, чем в задании
            if (enteredWordLetters[k] > taskLetters[k]) {
                return false;
            }
        }

        return true;
    }

    checkWord(event, enteredWord) {
        // слово уже было
        if (this.state.enteredWords.indexOf(enteredWord) > -1) {
            this.setState({ 
                showError: true,
                errorText: `Слово ${enteredWord} уже было`
            });
        }
        else {
            // можно ли вообще составить такое слово?
            if (this.wordCanBeAssembled(enteredWord, this.state.task)) {
                this.setState({ 
                    showError: false,
                    enteredWords: this.state.enteredWords.concat([enteredWord]),
                    enteredWord: ''
                });
            }
            // нет, нельзя
            else {
                this.setState({ 
                    showError: true,
                    errorText: `Невозможно составить слово ${this.state.enteredWord } из слова-задания`
                });
            }
        }

        event.preventDefault();
    }

    changeWord(event, word) {
        this.setState({ 
            showError: false,
            enteredWord: word
        });
    }
    
    render() {
        return (
            <div>
                <Task task={ this.state.task } newTask={ this.newTask.bind(this) } />

                <InputArea enteredWord={ this.state.enteredWord } checkWord={ this.checkWord.bind(this) } showError={ this.state.showError } errorText={ this.state.errorText } onChangeWord={ this.changeWord.bind(this) } />

                <EnteredWords words={ this.state.enteredWords } />

            </div>
        )
    }
}

class WordError extends React.Component {
    render() {
        if (this.props.isVisible) {

            return (
                <FormGroup>
                    <Col sm={8} smOffset={2}>
                        <Alert bsStyle="danger">
                            { this.props.errorText }
                        </Alert>
                    </Col>
                </FormGroup>
            );

        }

        return null;

    }
}

class EnteredWords extends React.Component {
    render() {
        if (this.props.words.length > 0) {
            let listWords = this.props.words.map((word) =>
                <li key={ word }>{ word }</li>
            );

            return (
                <Row>
                    <Col sm={8} smOffset={2}>
                        <h1>Введенные слова ({ this.props.words.length })</h1><br/>
                        { listWords }
                    </Col>
                </Row>
            );
        }

        return null;
    }
}

export default App