import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Typography from '@material-ui/core/Typography';
import { createTodo } from './graphql/mutations'
import { onCreateTodo } from './graphql/subscriptions'

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
    margin: '1.5rem 0'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  empty: {
    margin: '1.5rem 0'
  }
}));

const AuthStateApp = () => {
  const classes = useStyles();
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();
  const [value, setValue] = React.useState('');
  const [todos, setTodos] = React.useState([]);

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });

    // todoの作成を監視
    const todoList = []
    API.graphql(
      graphqlOperation(onCreateTodo)
    ).subscribe({
      next: eventData => {
        todoList.push(eventData.value.data.onCreateTodo)
        setTodos([...todoList]) // create new object
      }
    });
  }, []);

  const addTodo = async () => {
    await API.graphql(graphqlOperation(createTodo, {
      input: {
        name: value
      }
    }))
    setValue('')
    alert('Todoを作成しました')
  }

  return authState === AuthState.SignedIn && user ? (
    <DialogContent>
      <div>こんにちは, {user.username} さん</div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper component="form" className={classes.root}>
            <InputBase
              className={classes.input}
              placeholder="ToDoを入力してください"
              value={value}
              onChange={event => setValue(event.target.value)}
            />
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton onClick={addTodo} color="primary" className={classes.iconButton} aria-label="directions">
              <AddIcon />
            </IconButton>
          </Paper>
        </Grid>
        <Grid item md={12}>
          <Typography variant="h5">Todos Lists size : {todos.length}</Typography>
          {0 < todos.length && todos.map(todo =>
            <Grid item key={todo.id} xs={12}>
              <Paper component="form" className={classes.root}>
                <InputBase
                  className={classes.input}
                  value={todo.name}
                  disabled
                />
                <Divider className={classes.divider} orientation="vertical" />
                <IconButton onClick={addTodo} color="primary" className={classes.iconButton} aria-label="directions">
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </Grid>
          )}
          {0 === todos.length && (<Grid className={classes.empty} item md={12}>Todoなし</Grid>)}
          <Grid item md={12}>
            <AmplifySignOut />
          </Grid>
        </Grid>
      </Grid>
    </DialogContent>
  ) : (
      <AmplifyAuthenticator />
    );
}

export default AuthStateApp;
