package providers

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/gin-gonic/gin"
	swgErr "github.com/go-openapi/errors"
	"net/http"
)

// GetProvidersList handles get …/providers
func GetProvidersList(ctx *gin.Context) {
	providers, err := caliopen.Facilities.RESTfacility.RetrieveProvidersList()
	if err != nil && err.Error() != "not found" {
		e := swgErr.New(http.StatusInternalServerError, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	ret := struct {
		Total     int        `json:"total"`
		Providers []Provider `json:"providers,omitempty"`
	}{len(providers), providers}
	ctx.JSON(http.StatusOK, ret)
}

// GetProvider handles get …/providers/:provider_name
func GetProvider(ctx *gin.Context) {
	userID, err := operations.NormalizeUUIDstring(ctx.GetString("user_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	provider, errC := caliopen.Facilities.RESTfacility.GetProviderOauthFor(userID, ctx.Param("provider_name"))
	if errC != nil {
		returnedErr := new(swgErr.CompositeError)
		switch errC.Code() {
		case NotFoundCaliopenErr:
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "RESTfacility returned error"), errC, errC.Cause())
		default:
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "RESTfacility returned error"), errC, errC.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
		return
	}
	ctx.JSON(http.StatusOK, provider)
}

// CallbackHandler handles get …/providers/:provider_name/callback
func CallbackHandler(ctx *gin.Context) {
	switch ctx.Param("provider_name") {
	case "twitter":
		token := ctx.Query("oauth_token")
		verifier := ctx.Query("oauth_verifier")
		_, errC := caliopen.Facilities.RESTfacility.CreateTwitterIdentity(token, verifier)
		if errC != nil {
			returnedErr := new(swgErr.CompositeError)
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "RESTfacility returned error"), errC, errC.Cause())
			http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
			ctx.Abort()
			return
		}
		ctx.Status(http.StatusOK)
	case "gmail":
		state := ctx.Query("state")
		code := ctx.Query("code")
		_, errC := caliopen.Facilities.RESTfacility.CreateGmailIdentity(state, code)
		if errC != nil {
			returnedErr := new(swgErr.CompositeError)
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "RESTfacility returned error"), errC, errC.Cause())
			http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
			ctx.Abort()
			return
		}
		ctx.Status(http.StatusOK)
	default:
		e := swgErr.New(http.StatusNotImplemented, "not implemented")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

}
