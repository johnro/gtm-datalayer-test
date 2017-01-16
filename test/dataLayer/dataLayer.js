const testUtils = require('../../lib/testUtils')
const getWindowDataLayer = testUtils.getWindowDataLayer
const getJsonSchema = testUtils.getJsonSchema
const dataLayerConf = require('./dataLayer.conf.json')
const dataLayerName = dataLayerConf.dataLayerName || 'dataLayer'

describe('Testing Google Tag Manager\'s dataLayer composition on ' + dataLayerConf.baseUrl, () => {

    context('with generic tests', () => {

        context('on page ' + dataLayerConf.basePath, () => {

            before(() =>
              browser.url(dataLayerConf.baseUrl).waitForVisible('body', 5000)
            )

            it('expect dataLayer to be an Array', () =>
              expect(getWindowDataLayer(dataLayerName)).to.be.an('Array')
            )

            it('expect dataLayer to have one gtm.js event', () => {
                const objectsWithGtmJs = getWindowDataLayer(dataLayerName).filter(o => o.event === 'gtm.js')
                expect(objectsWithGtmJs).to.have.lengthOf(1)
            })

            it('expect dataLayer to have globally defined keys', () => {
                dataLayerConf.dataLayer.forEach(dlObj => {
                    if (dlObj['@json'] === false) {
                        delete dlObj['@json']
                        assert.containSubset(getWindowDataLayer(dataLayerName), [dlObj], 'FAILED ON: ' + JSON.stringify(dlObj), null, 2)
                    } else {
                        assert.jsonSchema(
                            getWindowDataLayer(dataLayerName),
                            getJsonSchema(dlObj),
                            'FAILED ON: ' + JSON.stringify(dlObj, null, 2)
                        )
                    }
                })
            })
        })

    })

    context('with custom tests', () => {

        dataLayerConf.page.forEach(testPage => {

            context('on page ' + testPage.path, () => {

                before(() =>
                    browser.url(dataLayerConf.baseUrl + testPage.path).waitForVisible('body', 5000)
                )

                testPage.dataLayer.forEach(dlObj => {
                    it('expect ' + dlObj['@expect'], () => {
                        delete dlObj['@expect']
                        if (dlObj['@json'] === false) {
                            delete dlObj['@json']
                            assert.containSubset(getWindowDataLayer(dataLayerName), [dlObj], 'FAILED ON: ' + JSON.stringify(dlObj), null, 2)
                        } else {
                            assert.jsonSchema(
                                getWindowDataLayer(dataLayerName),
                                getJsonSchema(dlObj),
                                'FAILED ON: ' + JSON.stringify(dlObj, null, 2)
                            )
                        }
                    })
                })

            })

        })

    })

})