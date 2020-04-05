import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Loading, Tabs, Icon } from "element-react";
import { Link } from "react-router-dom";
import { getMarket } from "../graphql/queries";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";

class MarketPage extends React.Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false,
    owner: null,
  };

  async componentDidMount() {
    await this.handleGetMarket();
    if (this.state.isMarketOwner) {
      this.setState({ owner: this.props.user.attributes.email });
    }
  }

  handleGetMarket = async () => {
    const input = { id: this.props.marketId };
    const result = await API.graphql(graphqlOperation(getMarket, input));
    this.setState({ market: result.data.getMarket, isLoading: false }, () => [
      this.checkMarketOwner(),
    ]);
  };

  checkMarketOwner = async () => {
    const { user } = this.props;
    const { market } = this.state;
    if (user) {
      this.setState({ isMarketOwner: user.username === market.owner });
    }
  };

  render() {
    const { market, isLoading, isMarketOwner, owner } = this.state;
    return isLoading ? (
      <Loading fullScreen />
    ) : (
      <>
        <Link className="link" to="/">
          Back to Markets List
        </Link>

        <span className="items-center pt-2">
          <h2 className="mb-mr">{market.name}</h2> - {owner}
        </span>

        <div className="items-center pt-2">
          <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
            <Icon name="date" className="icon" />
            {market.createdAt}
          </span>
        </div>

        <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
          {isMarketOwner && (
            <Tabs.Pane
              label={
                <>
                  <Icon name="plus" className="icon" />
                  Add Product
                </>
              }
              name="1"
            >
              <NewProduct marketId={this.props.marketId} />
            </Tabs.Pane>
          )}

          <Tabs.Pane
            label={
              <>
                <Icon name="menu" className="icon" />
                Products ({market.products.items.length})
              </>
            }
            name="2"
          >
            <div className="product-list">
              {market.products.items.map((product) => (
                <Product product={product} />
              ))}
            </div>
          </Tabs.Pane>
        </Tabs>
      </>
    );
  }
}

export default MarketPage;
