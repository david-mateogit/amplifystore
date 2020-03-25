import React from "react";
import { Auth, Hub, Logger } from "aws-amplify";
import { Authenticator, AmplifyTheme, Greetings } from "aws-amplify-react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";

import "./App.css";

class App extends React.Component {
  state = {
    user: null,
  };

  logger = new Logger("My-Logger");

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this.listener);
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    return user ? this.setState({ user }) : this.setState({ user: null });
  };

  listener = (data) => {
    switch (data.payload.event) {
      case "signIn":
        this.logger.error("user signed in");
        this.getUserData();
        break;
      case "signUp":
        this.logger.error("user signed up");
        break;
      case "signOut":
        this.logger.error("user signed out");
        this.setState({ user: null });
        break;
      case "signIn_failure":
        this.logger.error("user sign in failed");
        break;
      case "configured":
        this.logger.error("the Auth module is configured");
        break;
      default:
    }
  };

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.error("Error signin out user", err);
    }
  };

  render() {
    const { user } = this.state;
    return !user ? (
      <Authenticator hide={[Greetings]} theme={theme} />
    ) : (
      <Router>
        <>
          <Navbar
            user={user.attributes.email}
            handleSignOut={this.handleSignOut}
          />
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route
              exact
              path="/markets/:marketId"
              component={({ match }) => (
                <MarketPage marketId={match.params.marketId} />
              )}
            />
          </div>
        </>
      </Router>
    );
  }
}

const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "var(--amazonOrange)",
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5px",
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "var(--squidInk)",
  },
};

// export default withAuthenticator(App, true, [], null, theme);

export default App;
