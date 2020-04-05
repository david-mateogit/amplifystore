import React from "react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from "element-react";
import { createProduct } from "../graphql/mutations";
import aws_exports from "../aws-exports";
import { convertDollarsToCents } from "../utils/index";

const initialState = {
  description: "",
  price: "",
  shipped: false,
  image: {},
  isUploading: false,
  percentUploaded: 0,
};

class NewProduct extends React.Component {
  state = {
    ...initialState,
    display: true,
  };

  handleAddProduct = async () => {
    try {
      console.log(this.state);
      this.setState({ isUploading: true });
      const visibility = "public";
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        this.state.image.name
      }`;
      const uploadedFile = await Storage.put(filename, this.state.image.file, {
        contentType: this.state.image.type,
        progressCallback: (progress) => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          );
          this.setState({ percentUploaded });
        },
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region,
      };

      const input = {
        productMarketId: this.props.marketId,
        description: this.state.description,
        shipped: this.state.shipped,
        price: convertDollarsToCents(this.state.price),
        file,
      };

      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );

      console.log("uploaded product", result);

      Notification({
        title: "Success",
        message: "Product successfully created!",
      });
      this.setState({ ...initialState }, () => {
        this.timer();
      });
    } catch (error) {
      Notification({
        title: "Error",
        message: "Error creating product!",
      });
      console.error(error);
    }
  };

  timer = () => {
    this.setState({ display: false });
    setTimeout(() => {
      this.setState({ display: true });
    }, 500);
  };

  render() {
    const {
      description,
      price,
      image,
      shipped,
      isUploading,
      display,
      percentUploaded,
    } = this.state;
    return (
      <div className="flex-center">
        <h2 className="header">Add New Product</h2>
        <div>
          <Form className="market-header" labelPosition="top">
            <Form.Item label="Add Product Description">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                value={description}
                onChange={(description) => this.setState({ description })}
              />
            </Form.Item>
            <Form.Item label="Set Product Price">
              <Input
                type="number"
                icon="plus"
                value={price}
                placeholder="Price ($USD)"
                onChange={(price) => this.setState({ price })}
              />
            </Form.Item>
            <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
              <div className="text-center">
                <Radio
                  value="true"
                  checked={shipped === true}
                  onChange={() => this.setState({ shipped: true })}
                >
                  Shipped
                </Radio>
                <Radio
                  value="false"
                  checked={shipped === false}
                  onChange={() => this.setState({ shipped: false })}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
            {percentUploaded > 0 && (
              <Progress
                type="circle"
                className="progress"
                percentage={percentUploaded}
              />
            )}
            {display && (
              <PhotoPicker
                title="Product Image"
                preview
                onPick={(file) => this.setState({ image: file })}
                theme={{
                  formContainer: {
                    margin: 0,
                    padding: "0.8em",
                  },
                  formSection: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  sectionBody: {
                    margin: 0,
                    width: "250px",
                  },
                  sectionHeader: {
                    padding: "0.2em",
                    color: "var(--darkAmazonOrange)",
                  },
                  photoPickerButton: {
                    marginTop: "0.5rem",
                  },
                }}
              />
            )}
            <Form.Item>
              <Button
                disabled={!image.name || !description || !price || isUploading}
                type="primary"
                onClick={this.handleAddProduct}
                loading={isUploading}
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default NewProduct;
