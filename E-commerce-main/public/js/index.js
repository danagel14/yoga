const Cart = new LocalStorage();
      document.getElementById("cart-count").innerText = Cart.quantityCart();
      let itemId = null;
const tempElement = document.getElementById("temp");

tempElement.addEventListener("mouseover", function () {
  if (this.ariaValueNow >= 25 && this.ariaValueNow <= 35) {
    let temp = Number(this.ariaValueNow).toFixed(1);
    document.getElementById(
      "temp-value"
    ).innerHTML = `temp: ${temp}°C\n <p class='yoga'>Great time for yoga</p>`;
  } else {
    document.getElementById("temp-value").innerHTML = `temp: ${temp} + "°C"`;
  }
});

tempElement.addEventListener("mouseout", function () {
  document.getElementById("temp-value").innerHTML = "";
});

      function handleSearch(role) {
        $.ajax({
          url: "/search-product",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            productName: $("#productName").val(),
          }),
          success: function (response) {
            updateProductList(response, role);
            $("#message-box").text("")
          },
          error: function (error) {
            updateProductList([], role)
            $("#message-box").text(error?.responseJSON?.message);
          },
        });
    }

    function handleFilter(role) {
      $.ajax({
          url: "/filter-product",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            productName: $("#name").val(),
            price: $("#price").val(),
            category: $("#category").val(),
          }),
          success: function (response) {
            $("#message-box").text("")
            if(response.length > 0){
              updateProductList(response, role);
            }else{
              updateProductList([], role)
              $("#message-box").text("Product not found")
            }
          },
          error: function (error) {
            $("#message-box").text(error?.responseJSON?.message);
          },
        });
    }

    function updateProductList(products, role) {
      const shopSection = $(".shop");
      shopSection.empty();
      let productHtml = ``;
    
      products.map((product) => {
        productHtml += `
          <div class="product">
            <span>${product.productName}</span>
            <div class="image">
              <img src="${product.pathImage}" alt="product" />
            </div>
            <span class="data">
              <span>${product.price}&#8362;</span>
              <span>${product.description}</span>
            </span>
            <div class="actions">
              <button
                class="add"
                data-product='${JSON.stringify(product)}'
                onclick="Cart.handleCart(this)"
              >
                Add
              </button>`;
    
        if (role === "ADMIN") {
          productHtml += `
              <button
                value="${product._id}"
                onclick="showPopup(this.value)"
                class="delete"
              >
                Delete
              </button>
              <button class="edit">
                <a href="/admin/dashboard/update-product/${product._id}"> Edit </a>
              </button>`;
        }
    
        productHtml += `
            </div>
          </div>`;
      });
    
      shopSection.append(productHtml);
    }
      function showPopup(productId) {
        itemId = productId;
        document.getElementById("popup").style.display = "flex";
      }

      document.getElementById("send").addEventListener("click", handleDelete);
      document.getElementById("close").addEventListener("click", function () {
        document.getElementById("popup").style.display = "none";
      });