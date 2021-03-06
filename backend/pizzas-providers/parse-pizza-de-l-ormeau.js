const request = require('request')
const cheerio = require('cheerio')

const { requestOptions } = require('../helpers/http.helper')

const { PizzasModel } = require('../models/pizzas.model')
const { PizzasCategoriesModel } = require('../models/pizzas-categories.model')

class PizzaDeLOrmeau {
  constructor() {
    this._url = 'http://www.pizzadelormeau.com/nos-pizzas/'
  }

  getPizzasAndPizzasCategories() {
    return new Promise(resolve => {
      // fetch the website
      request(
        Object.assign({ url: this._url }, requestOptions),
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            // build the response object containing the pizzas and pizzas categories
            const res = {
              pizzas: [],
              pizzasCategories: []
            }

            const $ = cheerio.load(body)

            const sectionsDom = $('.entry-content .section')

            sectionsDom.map(i => {
              const sectionDom = $(sectionsDom[i])

              const pizzaCategory = sectionDom.find($('.title')).children().remove().end().text()

              const finalPizzaCategory = {
                id: PizzasCategoriesModel.getNewId(),
                name: pizzaCategory,
                pizzasIds: []
              }

              res.pizzasCategories.push(finalPizzaCategory)

              const pizzasDom = sectionDom.find($('.corps'))

              pizzasDom.map(j => {
                const pizzaDom = $(pizzasDom[j])

                const pizzaName = pizzaDom.find($('.nom')).children().remove().end().text()
                const pizzaIngredients = pizzaDom.find($('.composition')).text()
                const pizzaPricesDom = pizzaDom.find($('.prix'))

                const pizzaPrices = []
                pizzaPricesDom.map(k => {
                  const price = $(pizzaPricesDom[k]).children().remove().end().text().replace(',', '.')
                  pizzaPrices.push(parseFloat(price))
                })

                const finalPizza = {
                  id: PizzasModel.getNewId(),
                  name: pizzaName,
                  ingredients: pizzaIngredients,
                  prices: pizzaPrices
                }

                finalPizzaCategory.pizzasIds.push(finalPizza.id)
                res.pizzas.push(finalPizza)
              })
            })

            resolve(res)
          }
        })
    })
  }
}

module.exports = { PizzaDeLOrmeau }
