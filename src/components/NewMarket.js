import React from "react";

// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from "element-react"
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserConsumer } from "../UserContext";

class NewMarket extends React.Component {
  state = {
    name: "",
    tags: ["Arts", "Web Dev", "Technology", "Crafts", "Entertainment"],
    selectedTags: [],
    options: [],
    addMarketDialog: false,
  };

  handleAddMarket = async (e, user) => {
    e.preventDefault();

    try {
      this.setState({ addMarketDialog: false });
      const input = {
        name: this.state.name,
        tags: this.state.selectedTags,
        owner: user.username,
        createdAt: Date.now(),
      };
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.info(`Created market: id ${result.data.createMarket.id}`);
      this.setState({ name: "", selectedTags: [] });
    } catch (err) {
      console.error("Error add new market", err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error adding market"}`,
      });
    }
  };

  handleFilterTags = (query) => {
    const options = this.state.tags
      .map((tag) => ({ value: tag, label: tag }))
      .filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));

    this.setState({ options });
  };

  render() {
    return (
      <UserConsumer>
        {({ user }) => (
          <>
            <div className="market-header">
              <h1 className="market-title">
                Create Your MarketPlace
                <Button
                  type="text"
                  icon="edit"
                  className="market-title-button"
                  onClick={() => this.setState({ addMarketDialog: true })}
                />
              </h1>
              <Form inline onSubmit={this.props.handleSearch}>
                <Form.Item>
                  <Input
                    value={this.props.searchTerm}
                    placeholder="Search Markets..."
                    icon="circle-cross"
                    onChange={this.props.handleSearchChange}
                    onIconClick={this.props.handleClearSearch}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    nativeType="submit"
                    type="info"
                    icon="search"
                    onClick={this.props.handleSearch}
                    loading={this.props.isSearching}
                  >
                    Search
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <Dialog
              title="Create New Market"
              visible={this.state.addMarketDialog}
              onCancel={() => this.setState({ addMarketDialog: false })}
              size="large"
              customClass="dialog"
            >
              <Dialog.Body>
                <Form
                  className="en-US"
                  labelPosition="top"
                  onSubmit={(e) => this.handleAddMarket(e, user)}
                >
                  <Form.Item label="Add Market Name">
                    <Input
                      placeholder="Market Name"
                      trim
                      onChange={(name) => this.setState({ name })}
                      value={this.state.name}
                    />
                  </Form.Item>
                  <Form.Item label="Add Tags">
                    <Select
                      multiple
                      filterable
                      placeholder="Market Tags"
                      onChange={(selectedTags) =>
                        this.setState({ selectedTags })
                      }
                      remoteMethod={this.handleFilterTags}
                      remote
                    >
                      {this.state.options.map((option) => (
                        <Select.Option
                          key={option.value}
                          label={option.value}
                          value={option.value}
                        />
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => this.setState({ addMarketDialog: false })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  disabled={!this.state.name}
                  onClick={(e) => this.handleAddMarket(e, user)}
                >
                  Add
                </Button>
              </Dialog.Footer>
            </Dialog>
          </>
        )}
      </UserConsumer>
    );
  }
}

export default NewMarket;
