import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';  
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import db from 'store2';
import queryString from 'query-string';

import { instanceBody } from '../../ce-util';
import WelcomeBox from '../WelcomeBox';
import ObjectMenu from './ObjectMenu';
import LoginCardList from '../LoginCardsContainer/LoginCardList';
import DataTable from '../DataDashboard/DataTable';

const drawerWidth = 240;

const styles = theme => ({
  root: {
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-left': {
    marginLeft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    height: '100%',
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: 'calc(100% - 56px)',
    minHeight: window.innerHeight * 0.9,
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
});

class NavBar extends Component {
  state = {
    open: false,
    anchor: 'left',
    route: null
  };


  changeRoute = (newRoute) => {
    this.setState({
        route: newRoute
    });
  }


//   createInstance(oauthCode, state){
//     let {ceKeys, vendorData, vendorCallbackUrl, baseUrl} = this.props;
//     let path= `elements/${vendorData.elementKey}/instances`;
//     let body= instanceBody(vendorData.elementKey, oauthCode, vendorCallbackUrl, vendorData, state)
//     let config = {
//         method: 'POST',
//         headers: {
//             'Authorization': `User ${ceKeys.userToken}, Organization ${ceKeys.orgToken}`,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(body)
//     }
//     const request = async () => {
//         console.log(config);
//         const response = await fetch(`${baseUrl}/${path}`, config);
//         const json = await response.json();
//         // store instance token on response
//         if (await json.token){
//             await db(state, json.token);
//         }
//     }
//     request();
// }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  // componentWillMount() {
  //   let {vendorData} = this.props;
  //   let queryParams = queryString.parse(window.location.search);
  //   // If an OAuth code is detected use it to create an instance
  //   if (queryParams.state === vendorData.elementKey){
  //       console.log(queryParams.code)
  //       this.createInstance(queryParams.code, queryParams.state);
  //   }
  // }
  
  render() {
    const { classes, theme, ceKeys, appUrl } = this.props;
    const { anchor, open, route } = this.state;

    const drawer = (
      <Drawer
        type="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor={anchor}
        open={open}
      >
        <div className={classes.drawerInner}>
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <ObjectMenu 
            classes={classes}
            tableChanger={(newRoute) => this.changeRoute(newRoute)}
          />
        </div>
      </Drawer>
    );
    // login cards to be rendered if the integration route is live
    const integrationCards = () => {
      if (route === "integrations"){
        return (<LoginCardList
          ceKeys={ ceKeys}
          appUrl={ appUrl}
          route={route}
        />);
      } else {
        return null;
      }
    };

    const dataTable = () => {
      if (route !== "integrations" && route){
        return (<DataTable 
                  contentType={route}
                  ceKeys={ ceKeys}
                  baseUrl="https://staging.cloud-elements.com/elements/api-v2"
                />);
      } else {
        return null;
      }
    };

  

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open,
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" noWrap>
                SaaS Demo App
              </Typography>
            </Toolbar>
          </AppBar>
          {drawer}
          <main
            className={classNames(classes.content, classes[`content-${anchor}`], {
              [classes.contentShift]: open,
              [classes[`contentShift-${anchor}`]]: open,
            })}
          >
            {/* display main content based on route */}
            <WelcomeBox route={route} />
            {integrationCards()}
            {dataTable()}
          </main>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(NavBar);