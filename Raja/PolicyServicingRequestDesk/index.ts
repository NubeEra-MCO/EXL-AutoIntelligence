import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './src/App';

export class PolicyServicingRequestDesk
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private _context: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged: () => void;
  private _container: HTMLDivElement;
  private _root: Root;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    this._context = context;

    const props = {
      environmentUrl: context.parameters.environmentUrl?.raw ?? '',
      userId: context.parameters.userId?.raw ?? '',
      userRoles: context.parameters.userRoles?.raw ?? '',
      themeMode: (context.parameters.themeMode?.raw ?? 'light') as 'light' | 'dark',
      enableAI: context.parameters.enableAI?.raw ?? false,
      context,
    };

    return React.createElement(App, props);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    if (this._root) {
      this._root.unmount();
    }
  }
}
